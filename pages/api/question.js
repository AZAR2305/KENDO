// API route for answering questions using Nuclia RAG
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { document_id, question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    // Progress RAG API configuration
    const ragApiBase = process.env.RAG_API_BASE;
    const ragKey = process.env.RAG_KEY;
    const serviceKey = process.env.NUCLIA_SERVICE_KEY;
    const knowledgeBoxId = process.env.KB_ID;
    const userId = process.env.USER_ID || 'user1';

    if (!ragKey || !knowledgeBoxId) {
      return res.status(500).json({ 
        error: 'Configuration missing',
        details: 'RAG_KEY or KB_ID not configured'
      });
    }

    try {
      // Use the working /ask endpoint with OpenAI + Azure ChatGPT-4o
      console.log('Answering question with OpenAI + Azure ChatGPT-4o...');
      console.log('Using JWT Bearer:', `${ragKey.substring(0, 20)}...`);
      console.log('Question:', question.substring(0, 100) + '...');
      
      // Use original question directly - no enhancements
      const enhancedQuery = question;
      
      const askResponse = await fetch(`https://aws-us-east-2-1.nuclia.cloud/api/v1/kb/${knowledgeBoxId}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-NUCLIA-SERVICEACCOUNT': `Bearer ${ragKey}`,
        },
        body: JSON.stringify({
          query: enhancedQuery,
          features: ["semantic"],
          show: ["basic"]
        }),
      });

      let answer = '';
      let sources = [];
      let confidence = 0;

      if (askResponse.ok) {
        try {
          const responseText = await askResponse.text();
          console.log('Raw /ask response:', responseText.substring(0, 200) + '...');
          
          // Parse streaming NDJSON response
          const lines = responseText.trim().split('\n').filter(line => line.trim());
          let fullAnswer = '';
          let citations = [];
          
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.item && parsed.item.text) {
                fullAnswer += parsed.item.text;
              }
              if (parsed.citations) {
                citations = parsed.citations;
              }
            } catch (parseError) {
              console.log('Failed to parse line:', line);
            }
          }

          if (fullAnswer.trim()) {
            console.log('✅ SUCCESS: Got OpenAI ChatGPT-4o generated answer!');
            answer = fullAnswer.trim();
            confidence = 0.9; // High confidence for OpenAI responses
            
            // Convert citations to sources format
            if (citations && citations.length > 0) {
              sources = citations.slice(0, 3).map(citation => ({
                text: citation.text || citation.content || '',
                score: citation.score || 0.8,
                page: citation.page || null,
                position: citation.position || null
              }));
            }
          }
        } catch (parseError) {
          console.log('Question answering parsing error:', parseError.message);
        }
      } else {
        const errorText = await askResponse.text();
        console.log('/ask endpoint failed with status:', askResponse.status, 'Error:', errorText);
      }

      // No fallback - return OpenAI's response as-is
      console.log('✅ Using OpenAI response without fallback:', answer.substring(0, 100) + '...');

      res.status(200).json({ 
        answer: answer,
        question: question,
        document_id: document_id,
        knowledge_box_id: knowledgeBoxId,
        sources: sources,
        confidence: confidence,
        answered_at: new Date().toISOString()
      });

    } catch (ragError) {
      console.error('Progress RAG error:', ragError);
      
      // Check for authentication errors and fall back to simulation
      if (ragError.message?.includes('401') || ragError.message?.includes('403') || ragError.message?.includes('invalid_token') || 
          ragError.message?.includes('Jwt verification fails') || ragError.message?.includes('kid:sa token') || ragError.message?.includes('AnonymousUser')) {
        console.warn('Authentication failed for Progress RAG API, falling back to simulation mode');
        
        // Return simulated answer
        const simulatedAnswer = generateSimulatedAnswer(question);
        
        return res.status(200).json({ 
          answer: simulatedAnswer,
          question: question,
          document_id: document_id,
          source: 'simulated',
          confidence: 0.7,
          mode: 'offline',
          answered_at: new Date().toISOString()
        });
      }
      
      // For other errors, return error response
      return res.status(500).json({ 
        error: 'Failed to generate answer',
        details: ragError.message 
      });
    }

  } catch (error) {
    console.error('Question answering error:', error);
    res.status(500).json({ 
      error: 'Failed to generate answer',
      details: error.message 
    });
  }
}


