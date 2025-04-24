from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import PyPDF2
import docx
from pathlib import Path
from groq import Groq
import os
import shutil
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

groq_client = Groq(api_key=groq_api_key)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SETUP ---
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Store file contents in memory (in a real app, use a proper database)
file_contents = {}

# --- READ FILE FUNCTIONS ---
def read_csv(file_path: str) -> str:
    df = pd.read_csv(file_path)
    return df.to_string()

def read_excel(file_path: str) -> str:
    df = pd.read_excel(file_path)
    return df.to_string()

def read_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def read_pdf(file_path: str) -> str:
    text = ''
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
    return text

# --- DISPATCH FUNCTION ---
def read_file(file_path: str) -> str:
    ext = Path(file_path).suffix.lower()
    if ext == '.csv':
        return read_csv(file_path)
    elif ext in ['.xls', '.xlsx']:
        return read_excel(file_path)
    elif ext == '.docx':
        return read_docx(file_path)
    elif ext == '.pdf':
        return read_pdf(file_path)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

# --- AI FUNCTIONS ---
def summarize_with_groq(text: str) -> str:
    prompt = "Summarize the following document:\n\n" + text[:3000]
    response = groq_client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=300
    )
    return response.choices[0].message.content

def answer_question(text: str, question: str) -> str:
    prompt = f"Given the following document content, please answer this question: {question}\n\nDocument content:\n{text[:9000]}"
    response = groq_client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=300
    )
    return response.choices[0].message.content

class QuestionRequest(BaseModel):
    filename: str
    question: str

def parse_slides_from_ai_response(response_text: str) -> list:
    slides = []
    current_slide = None
    
    for line in response_text.split('\n'):
        line = line.strip()
        if not line:
            continue
            
        if line.lower().startswith('slide'):
            if current_slide and current_slide.get('title'):  # Only add slides that have at least a title
                slides.append(current_slide)
            current_slide = {"title": "", "content": "", "layout": "default"}
        elif current_slide:
            if line.lower().startswith('title:'):
                current_slide["title"] = line[6:].strip()
            elif line.lower().startswith('content:'):
                current_slide["content"] = line[8:].strip()
            elif line.lower().startswith('layout:'):
                layout = line[7:].strip().lower()
                current_slide["layout"] = layout if layout in ['title', 'bullets', 'split'] else 'default'
    
    # Add the last slide if it exists and has a title
    if current_slide and current_slide.get('title'):
        slides.append(current_slide)
    
    return slides
# --- API ENDPOINTS ---
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process the file
        content = read_file(file_path)
        summary = summarize_with_groq(content)
        
        # Store content in memory
        file_contents[file.filename] = content
        
        # Clean up
        os.remove(file_path)
        
        return JSONResponse(content={
            "summary": summary,
            "filename": file.filename,
            "content": content[:1000] + "..." if len(content) > 1000 else content  # Preview of content
        })
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    if request.filename not in file_contents:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        answer = answer_question(file_contents[request.filename], request.question)
        return JSONResponse(content={"answer": answer})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-slides")
async def generate_slides(request: Request):
    # Parse JSON payload
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # Extract with defaults
    audienceType = data.get("audienceType", "General Audience")
    technicalLevel = data.get("technicalLevel", "balanced")
    preferences = data.get("preferences", {})
    audienceInput = data.get("audienceInput", "")
    documentContent = data.get("documentContent", "")

    # Build prompt
    prompt = (
        f"Generate a presentation for a {audienceType} audience "
        f"at a {technicalLevel} technical level.\n"
        f"Context: {audienceInput}\n"
        f"Document content:\n{documentContent[:3000]}\n"
    )

    # Call Groq AI
    try:
        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{"role": "user", "content": prompt}]
        )
        ai_text = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation error: {str(e)}")

    # Return raw AI output as a single slide
    return JSONResponse(content={"slides": [{
        "title": f"{audienceType} Presentation",
        "content": ai_text,
        "layout": "title"
    }]}) 


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
