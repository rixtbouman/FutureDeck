/**
 * Generate images using MuleRouter Wan2.6-t2i API
 * Returns task ID immediately - frontend polls for status
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.MULEROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'MuleRouter API key not configured' });
  }

  // GET - Check task status
  if (req.method === 'GET') {
    const taskId = req.query.taskId;
    if (!taskId) {
      return res.status(400).json({ error: 'No taskId provided' });
    }

    try {
      const statusResponse = await fetch(`https://api.mulerouter.ai/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'FuturesDeck/1.0.0',
        },
      });

      const statusText = await statusResponse.text();
      if (!statusText) {
        return res.status(200).json({ status: 'processing', taskId: taskId });
      }

      let statusData;
      try {
        statusData = JSON.parse(statusText);
      } catch (e) {
        return res.status(200).json({ status: 'processing', taskId: taskId });
      }
      const status = statusData?.task_info?.status;

      if (status === 'completed' || status === 'success') {
        const images = statusData?.task_info?.result?.images ||
                       statusData?.images ||
                       statusData?.task_info?.images;

        if (images && images.length > 0) {
          return res.status(200).json({
            status: 'completed',
            imageUrl: images[0],
            taskId: taskId,
          });
        } else {
          return res.status(200).json({ status: 'completed', error: 'No images generated' });
        }
      }

      if (status === 'failed' || status === 'error') {
        const errorMsg = statusData?.task_info?.error?.detail ||
                         statusData?.task_info?.error?.message ||
                         'Image generation failed';
        return res.status(200).json({ status: 'failed', error: errorMsg });
      }

      // Still processing
      return res.status(200).json({ status: status || 'processing', taskId: taskId });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST - Create new task
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    // Create task
    const createResponse = await fetch('https://api.mulerouter.ai/vendors/alibaba/v1/wan2.6-t2i/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'FuturesDeck/1.0.0',
      },
      body: JSON.stringify({
        prompt: prompt,
        size: '1440*1440',
        n: 1,
        prompt_extend: false,
      }),
    });

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      return res.status(500).json({
        error: createData.detail || createData.message || 'Failed to create image task'
      });
    }

    const taskId = createData?.task_info?.id;
    if (!taskId) {
      return res.status(500).json({ error: 'No task ID returned' });
    }

    // Return task ID immediately - frontend will poll
    return res.status(200).json({
      status: 'pending',
      taskId: taskId,
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
