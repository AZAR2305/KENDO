// API route for uploading PDFs and storing them in Progress RAG
import formidable from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data using promises
    const form = formidable({ multiples: false });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.pdf;
    if (!file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // Handle array or single file
    const pdfFile = Array.isArray(file) ? file[0] : file;

    // Check file type
    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Read file content
    const fileContent = fs.readFileSync(pdfFile.filepath);

    // Generate document ID
    const documentId = uuidv4();

    // Progress RAG API configuration
    const ragApiBase = process.env.RAG_API_BASE;
    const ragKey = process.env.RAG_KEY;
    const serviceKey = process.env.NUCLIA_SERVICE_KEY;
    const knowledgeBoxId = process.env.KB_ID;
    const userId = process.env.USER_ID || 'user1';

    if (!ragKey || !knowledgeBoxId) {
      console.warn('RAG_KEY or KB_ID not set, simulating upload');
      // Clean up temp file
      if (fs.existsSync(pdfFile.filepath)) {
        fs.unlinkSync(pdfFile.filepath);
      }
      // Simulate successful upload
      return res.status(200).json({ 
        document_id: documentId,
        message: 'PDF uploaded successfully (simulated)' 
      });
    }

    try {
      // Debug: Log environment variables (remove sensitive data from logs in production)
      console.log('RAG API Base:', ragApiBase);
      console.log('RAG Key present:', !!ragKey);
      console.log('Knowledge Box ID:', knowledgeBoxId);
      console.log('Attempting to upload to:', `${ragApiBase}/v1/kb/${knowledgeBoxId}/resources`);
      
      // Convert file to base64 for JSON upload
      const fileBase64 = fileContent.toString('base64');
      
      // Prepare JSON payload for Progress RAG API
      const uploadPayload = {
        slug: `document-${documentId}`,
        title: pdfFile.originalFilename || `Document ${documentId}`,
        summary: `Uploaded PDF: ${pdfFile.originalFilename}`,
        origin: {
          source: "upload",
          source_id: documentId,
          filename: pdfFile.originalFilename || `document-${documentId}.pdf`
        },
        files: {
          file: {
            file: {
              filename: pdfFile.originalFilename || `document-${documentId}.pdf`,
              content_type: "application/pdf",
              payload: fileBase64
            }
          }
        }
      };
      
      // Upload the PDF using JSON payload
      const uploadResponse = await fetch(`${ragApiBase}/v1/kb/${knowledgeBoxId}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-NUCLIA-SERVICEACCOUNT': `Bearer ${ragKey}`,
        },
        body: JSON.stringify(uploadPayload),
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Progress RAG upload error: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', JSON.stringify(uploadResult, null, 2));

      // Clean up temp file
      if (fs.existsSync(pdfFile.filepath)) {
        fs.unlinkSync(pdfFile.filepath);
      }

      const actualDocumentId = uploadResult.uuid || uploadResult.id || documentId;
      console.log('Document ID being returned:', actualDocumentId);

      return res.status(200).json({ 
        document_id: actualDocumentId,
        knowledge_box_id: knowledgeBoxId,
        message: 'PDF uploaded and processed successfully',
        title: pdfFile.originalFilename || `Document ${documentId}`,
        nuclia_uid: uploadResult.uuid // Include the actual Nuclia UUID for reference
      });

    } catch (ragError) {
      console.error('Progress RAG error:', ragError);
      
      // Check if this is a DNS resolution error or authentication failure
      if (ragError.code === 'ENOTFOUND' || ragError.cause?.code === 'ENOTFOUND') {
        console.warn('DNS resolution failed for Progress RAG API, falling back to simulation mode');
      } else if (ragError.message?.includes('401') || ragError.message?.includes('403') || ragError.message?.includes('invalid_token') || ragError.message?.includes('Jwt verification fails') || ragError.message?.includes('kid:sa token') || ragError.message?.includes('AnonymousUser')) {
        console.warn('Authentication failed for Progress RAG API, falling back to simulation mode');
        
        // Clean up temp file
        if (fs.existsSync(pdfFile.filepath)) {
          fs.unlinkSync(pdfFile.filepath);
        }
        
        // Return simulated success response
        return res.status(200).json({ 
          document_id: documentId,
          title: pdfFile.originalFilename,
          message: 'PDF uploaded successfully (offline mode - Progress RAG API unavailable)',
          mode: 'simulation'
        });
      }
      
      // For other errors, return the original error response
      // Clean up temp file
      if (fs.existsSync(pdfFile.filepath)) {
        fs.unlinkSync(pdfFile.filepath);
      }
      return res.status(500).json({ 
        error: 'Failed to upload PDF to Progress RAG system',
        details: ragError.message 
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
