# 🤖 AI Provider Setup Guide

## **Option 1: Google Gemini (Recommended - Free)**

1. **Get API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Add to Environment**:
   ```bash
   # In .env.local
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Deploy to Vercel**:
   - Add environment variable: `GEMINI_API_KEY`
   - Set value to your Gemini API key

## **Option 2: Hugging Face (Free)**

1. **Get API Key** (Optional):
   - Go to [Hugging Face](https://huggingface.co/settings/tokens)
   - Create access token
   - Copy the token

2. **Add to Environment**:
   ```bash
   # In .env.local
   HUGGINGFACE_API_KEY=your_hf_token_here
   ```

3. **Deploy to Vercel**:
   - Add environment variable: `HUGGINGFACE_API_KEY`
   - Set value to your Hugging Face token

## **Option 3: OpenAI (Paid)**

1. **Get API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create new secret key
   - Copy the key

2. **Add to Environment**:
   ```bash
   # In .env.local
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Deploy to Vercel**:
   - Add environment variable: `OPENAI_API_KEY`
   - Set value to your OpenAI API key

## **Option 4: No AI (Fallback Only)**

If you don't want to use any AI:
- Don't add any API keys
- App will use rule-based fallback functionality
- All features still work, just without AI enhancement

## **🎯 Priority Order:**

The app will use AI providers in this order:
1. **OpenAI** (if `OPENAI_API_KEY` is set)
2. **Google Gemini** (if `GEMINI_API_KEY` is set)
3. **Hugging Face** (if `HUGGINGFACE_API_KEY` is set)
4. **Fallback** (if no keys are set)

## **✅ Benefits:**

- **No more quota errors** - Multiple AI options
- **Free alternatives** - Gemini and Hugging Face
- **Graceful fallback** - Always works
- **Easy switching** - Just change environment variables

## **🚀 Quick Start:**

1. **Get Gemini API key** (easiest free option)
2. **Add to Vercel environment variables**
3. **Deploy** - AI features will work!

The app will automatically detect which AI provider to use based on available API keys. 