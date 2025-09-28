// Helper function to parse OpenAI generated quiz questions
function parseQuizFromOpenAI(aiResponse) {
  const questions = [];
  
  try {
    // Clean the response and handle different formatting
    const cleanResponse = aiResponse
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/---/g, '') // Remove separators
      .replace(/\*\*QUESTION:\*\*/g, 'QUESTION:') // Handle bold questions
      .replace(/\*\*CORRECT:\*\*/g, 'CORRECT:') // Handle bold correct
      .replace(/\*\*EXPLANATION:\*\*/g, 'EXPLANATION:'); // Handle bold explanation
    
    // Split response into question blocks
    const questionBlocks = cleanResponse.split(/QUESTION:/i).slice(1);
    
    for (const block of questionBlocks) {
      try {
        const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l && !l.match(/^-+$/));
        
        if (lines.length < 4) continue; // Need at least question + some options + correct
        
        let questionText = lines[0].replace(/^\*+|\*+$/g, '').trim(); // Remove markdown
        const options = [];
        let correctAnswer = '';
        let explanation = '';
        
        // Parse options and other fields more flexibly
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          
          // Handle options with different formats: A), A., A:, etc.
          if (line.match(/^[A-D][.):\s]/i)) {
            const optionText = line.replace(/^[A-D][.):\s]*/i, '').trim();
            if (optionText) {
              options.push(optionText);
            }
          } 
          // Handle CORRECT field more flexibly
          else if (line.match(/^(CORRECT|ANSWER):/i)) {
            const correctPart = line.replace(/^(CORRECT|ANSWER):\s*/i, '').trim();
            if (correctPart.match(/^[A-D]$/i)) {
              // Letter format (A, B, C, D)
              const correctIndex = correctPart.toUpperCase().charCodeAt(0) - 65;
              if (correctIndex >= 0 && correctIndex < options.length) {
                correctAnswer = options[correctIndex];
              }
            } else {
              // Direct answer format
              correctAnswer = correctPart;
            }
          } 
          // Handle EXPLANATION field
          else if (line.match(/^EXPLANATION:/i)) {
            explanation = line.replace(/^EXPLANATION:\s*/i, '').trim();
          }
        }
        
        // More flexible validation - require at least question, some options, and correct answer
        if (questionText && options.length >= 2 && correctAnswer) {
          // Ensure we have 4 options by padding if necessary
          while (options.length < 4) {
            options.push(`Option ${options.length + 1}`);
          }
          
          // Ensure explanation exists
          if (!explanation) {
            explanation = `The correct answer is: ${correctAnswer}`;
          }
          
          questions.push({
            question: questionText,
            options: options,
            correct_answer: correctAnswer,
            explanation: explanation
          });
          
          console.log(`✅ Parsed question: ${questionText.substring(0, 50)}...`);
        } else {
          console.log(`⚠️ Skipped invalid question: missing requirements (question: ${!!questionText}, options: ${options.length}, correct: ${!!correctAnswer})`);
        }
      } catch (blockError) {
        console.log('⚠️ Failed to parse question block:', blockError.message);
      }
    }
  } catch (error) {
    console.error('❌ Error parsing OpenAI quiz response:', error);
  }
  
  return questions;
}

// API route for generating quizzes using OpenAI with RAG content
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { document_id, question_count = 5 } = req.body;

  if (!document_id) {
    return res.status(400).json({ error: 'Document ID is required' });
  }

  try {
    // Progress RAG API configuration
    const ragApiBase = process.env.RAG_API_BASE;
    const ragKey = process.env.RAG_KEY;
    const knowledgeBoxId = process.env.KB_ID;

    if (!ragKey || !knowledgeBoxId) {
      return res.status(500).json({ 
        error: 'Configuration missing',
        details: 'RAG_KEY or KB_ID not configured'
      });
    }

    // Step 1: Get comprehensive document content
    console.log('📚 Retrieving document content for OpenAI quiz generation...');
    console.log('🔍 Document ID:', document_id);
    console.log('🔍 Knowledge Box ID:', knowledgeBoxId);
    
    // First try with broader search to ensure we can get content
    const contentSearchResponse = await fetch(`${ragApiBase}/v1/kb/${knowledgeBoxId}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NUCLIA-SERVICEACCOUNT': `Bearer ${ragKey}`,
      },
      body: JSON.stringify({
        query: "data structures algorithms programming concepts", 
        features: ["semantic", "keyword"],
        show: ["basic", "values"],
        page_size: 20
        // Temporarily remove document filter to see if we get any content
        // filters: document_id ? [`/uuid:${document_id}`] : undefined
      }),
    });

    let documentContent = '';
    
    if (contentSearchResponse.ok) {
      const contentData = await contentSearchResponse.json();
      console.log('🔍 Found paragraphs:', contentData.paragraphs?.results?.length || 0);
      
      if (contentData.paragraphs && contentData.paragraphs.results && contentData.paragraphs.results.length > 0) {
        // Get comprehensive content from multiple paragraphs
        const allParagraphs = contentData.paragraphs.results.slice(0, 10);
        documentContent = allParagraphs.map(p => p.text).join('\n\n').substring(0, 4000);
        console.log('📖 Retrieved document content:', documentContent.length, 'characters');
      } else {
        console.log('❌ No document content found');
        return res.status(500).json({ 
          error: 'No document content available for quiz generation',
          details: 'The search did not return any content from the specified document.'
        });
      }
    } else {
      console.log('❌ Content search failed');
      return res.status(500).json({ 
        error: 'Failed to retrieve document content',
        details: 'Unable to access the document content for quiz generation.'
      });
    }

    // Step 2: Use OpenAI to generate diverse quiz questions
    console.log('🤖 Generating quiz questions using OpenAI...');
    const quizGenerationResponse = await fetch(`${ragApiBase}/v1/kb/${knowledgeBoxId}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NUCLIA-SERVICEACCOUNT': `Bearer ${ragKey}`,
      },
      body: JSON.stringify({
        query: `Based on the following document content, create ${question_count} diverse multiple-choice quiz questions. Each question should:

1. Test different aspects of the content (concepts, details, applications, analysis)
2. Have 4 realistic and contextually relevant answer choices
3. Include one correct answer and three plausible but incorrect distractors
4. Cover different sections/topics from the document
5. Vary in difficulty and question type

Document content:
${documentContent}

Format each question exactly like this:
QUESTION: [Question text]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]
CORRECT: [A, B, C, or D]
EXPLANATION: [Brief explanation of why the answer is correct]

Generate ${question_count} unique questions now:`,
        features: ["semantic"],
        show: ["basic"]
      }),
    });

    if (!quizGenerationResponse.ok) {
      console.log('❌ OpenAI quiz generation failed');
      return res.status(500).json({ 
        error: 'Failed to generate quiz questions',
        details: 'OpenAI quiz generation request failed.'
      });
    }

    // Step 3: Parse OpenAI's streaming response
    const responseText = await quizGenerationResponse.text();
    console.log('📥 Received OpenAI response length:', responseText.length);
    
    // Parse the streaming NDJSON response
    const lines = responseText.trim().split('\n').filter(line => line.trim());
    let fullResponse = '';
    
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.item && parsed.item.text) {
          fullResponse += parsed.item.text;
        }
      } catch (parseError) {
        // Skip invalid JSON lines
      }
    }

    console.log('🧠 OpenAI full response length:', fullResponse.length);
    console.log('🧠 OpenAI response preview:', fullResponse.substring(0, 500));
    
    if (!fullResponse || fullResponse.length < 100) {
      console.log('❌ Insufficient OpenAI response');
      return res.status(500).json({ 
        error: 'Insufficient response from OpenAI',
        details: 'OpenAI did not provide adequate content for quiz generation.'
      });
    }

    // Step 4: Parse the structured quiz questions
    const quiz = parseQuizFromOpenAI(fullResponse);
    
    if (quiz.length === 0) {
      console.log('❌ Failed to parse quiz questions from OpenAI response');
      return res.status(500).json({ 
        error: 'Failed to parse quiz questions',
        details: 'Could not extract valid quiz questions from OpenAI response.',
        raw_response: fullResponse.substring(0, 1000)
      });
    }

    console.log(`✅ Successfully generated ${quiz.length} quiz questions`);
    
    res.status(200).json({ 
      quiz: quiz,
      total_questions: quiz.length,
      document_id: document_id,
      knowledge_box_id: knowledgeBoxId,
      generated_at: new Date().toISOString(),
      source: 'openai'
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message 
    });
  }
}