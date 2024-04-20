// Import necessary libraries
const Web3 = require('web3');
const { GPT3 } = require('openai');
const express = require('express');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Initialize Web3 instance
const web3 = new Web3(window.ethereum);

// Initialize OpenAI API instance
const openai = new GPT3('YOUR_OPENAI_API_KEY');

// Endpoint for generating website content
app.post('/generate-content', async (req, res) => {
    try {
        // Extract parameters from request body
        const { contentLength, languageModel } = req.body;

        // Select the specified language model
        openai.setEngine(languageModel);

        // Generate AI-generated content
        const generatedContent = await openai.complete({
            prompt: 'Generate content for website...',
            max_tokens: contentLength,
            temperature: 0.7
        });

        // Return generated content to client
        res.json({ success: true, content: generatedContent.choices[0].text });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ success: false, error: 'Error generating content' });
    }
});

// Endpoint for processing payment via MetaMask
app.post('/process-payment', async (req, res) => {
    try {
        // Extract parameters from request body
        const { amount, recipientAddress } = req.body;

        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            // Request user to connect their wallet
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Send transaction to recipient address
            await web3.eth.sendTransaction({
                from: window.ethereum.selectedAddress,
                to: recipientAddress,
                value: web3.utils.toWei(amount, 'ether')
            });

            // Return success response
            res.json({ success: true, message: 'Payment successful' });
        } else {
            throw new Error('MetaMask is not installed');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ success: false, error: 'Error processing payment' });
    }
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
