/**
 * Generate images using MuleRouter Wan2.6-t2i API
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const apiKey = process.env.MULEROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'MuleRouter API key not configured' });
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
      console.error('MuleRouter create error:', createData);
      return res.status(500).json({
        error: createData.detail || createData.message || 'Failed to create image task'
      });
    }

    const taskId = createData?.task_info?.id;
    if (!taskId) {
      console.error('No task ID in response:', createData);
      return res.status(500).json({ error: 'No task ID returned' });
    }

    // Poll for completion (max 5 minutes)
    const maxAttempts = 60;
    const pollInterval = 5000; // 5 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await fetch(`https://api.mulerouter.ai/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'FuturesDeck/1.0.0',
        },
      });

      const statusData = await statusResponse.json();
      const status = statusData?.task_info?.status;

      if (status === 'completed' || status === 'success') {
        const images = statusData?.task_info?.result?.images ||
                       statusData?.images ||
                       statusData?.task_info?.images;

        if (images && images.length > 0) {
          return res.status(200).json({
            imageUrl: images[0],
            taskId: taskId,
          });
        } else {
          console.error('No images in completed task:', statusData);
          return res.status(500).json({ error: 'No images generated' });
        }
      }

      if (status === 'failed' || status === 'error') {
        const errorMsg = statusData?.task_info?.error?.detail ||
                         statusData?.task_info?.error?.message ||
                         'Image generation failed';
        return res.status(500).json({ error: errorMsg });
      }

      // Still processing, continue polling
    }

    return res.status(500).json({ error: 'Image generation timed out' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
