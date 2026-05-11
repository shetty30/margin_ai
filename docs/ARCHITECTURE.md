# Margin AI - Architecture Overview

## System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Mobile["📱 React Frontend<br/>Vite + Tailwind + SCSS"]
        SMS["📨 SMS Auto-Import<br/>UPI Bank Messages"]
    end

    subgraph API["API Layer"]
        FastAPI["🐍 FastAPI Backend<br/>Python 3.11<br/>JWT Authentication"]
    end

    subgraph Data["Data Layer"]
        MySQL["🗄️ MySQL 8.0<br/>Transaction Store<br/>User Profiles<br/>Budget & Goals"]
    end

    subgraph AI["AI/ML Services"]
        Chat["💬 Chat Service<br/>Qwen2.5-7B-Instruct<br/>HuggingFace API"]
        Fallback["🔄 Fallback LLM<br/>Groq llama-3.1-8b"]
        NLP["🧠 SMS Categoriser<br/>3-Stage Pipeline"]
    end

    subgraph External["External Services"]
        HF["🤗 HuggingFace<br/>Inference API"]
        Groq["⚡ Groq<br/>LLM API"]
        Distil["🔤 DistilBERT<br/>Zero-Shot NLI"]
    end

    Mobile -->|REST API| FastAPI
    SMS -->|Raw SMS Text| FastAPI
    FastAPI -->|Query/Insert| MySQL
    FastAPI -->|User Message + Context| Chat
    Chat -->|Primary| HF
    Chat -->|Fallback| Groq
    FastAPI -->|SMS Data| NLP
    NLP -->|Unknown Merchants| Distil
    Distil -->|Classification| MySQL
    FastAPI -->|Response| Mobile

    style Mobile fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000
    style FastAPI fill:#009688,stroke:#333,stroke-width:2px,color:#fff
    style MySQL fill:#4479A1,stroke:#333,stroke-width:2px,color:#fff
    style Chat fill:#FFD21E,stroke:#333,stroke-width:2px,color:#000
    style Fallback fill:#FF6B6B,stroke:#333,stroke-width:2px,color:#fff
    style NLP fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
```

## Component Breakdown

### Frontend (75% JavaScript)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + SCSS
- **Features**:
  - Live dashboard with spending analytics
  - Chat interface for financial queries
  - Income & savings setup page
  - User profile with avatar upload
  - Transaction history view

### Backend (20% Python)
- **Framework**: FastAPI (Python 3.11)
- **Authentication**: JWT tokens
- **API Endpoints**:
  - User management & auth
  - Transaction CRUD
  - Budget & goals management
  - Chat endpoint (with context injection)
  - SMS processing & categorization

### Database Layer (MySQL 8.0)
- User profiles & authentication
- Transaction history
- Budget & savings goals
- Chat message history
- Cached categorization results

## AI/ML Pipeline

### SMS Categorisation - 3-Stage NLP Pipeline

```mermaid
graph LR
    SMS["Raw Bank SMS<br/>e.g., 'Swiggy debit ₹450'"]
    
    Stage1["📌 Stage 1: Regex<br/>Amount + Merchant<br/>Transaction Type"]
    
    Stage2["🗺️ Stage 2: Keyword Map<br/>50+ Merchants<br/>Instant Match"]
    
    Stage3["🤖 Stage 3: DistilBERT NLI<br/>typeform/distilbert<br/>7-Category Zero-Shot"]
    
    Categories["🏷️ Categories<br/>Food · Transport<br/>Shopping · Entertainment<br/>Health · Utilities · Misc"]
    
    DB["💾 Store in MySQL"]
    
    SMS -->|Extract| Stage1
    Stage1 -->|Match Known?| Stage2
    Stage2 -->|Unknown?| Stage3
    Stage3 -->|Classify| Categories
    Categories -->|Persist| DB

    style SMS fill:#FFE082,stroke:#333,stroke-width:2px
    style Stage1 fill:#81C784,stroke:#333,stroke-width:2px,color:#fff
    style Stage2 fill:#64B5F6,stroke:#333,stroke-width:2px,color:#fff
    style Stage3 fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
    style Categories fill:#FF7043,stroke:#333,stroke-width:2px,color:#fff
    style DB fill:#4479A1,stroke:#333,stroke-width:2px,color:#fff
```

**Efficiency**: Regex + keyword map handle ~90% of cases. DistilBERT only fires for unknown merchants—keeping it fast and free.

### Chat with Context - Qwen2.5-7B-Instruct

```mermaid
sequenceDiagram
    participant User
    participant FastAPI
    participant MySQL
    participant Qwen as HuggingFace<br/>Qwen2.5-7B
    participant Groq

    User->>FastAPI: "Can I afford a ₹5000 flight?"
    FastAPI->>MySQL: Fetch user budget, goals,<br/>recent transactions, balance
    MySQL-->>FastAPI: Context data
    FastAPI->>Qwen: User message +<br/>SQL context injection
    alt HuggingFace Available
        Qwen-->>FastAPI: Context-aware answer
    else HuggingFace Unavailable
        FastAPI->>Groq: Fallback to<br/>llama-3.1-8b
        Groq-->>FastAPI: Response
    end
    FastAPI-->>User: Answer with reasoning
```

## Data Flow - Income to Margin

```mermaid
graph TB
    Income["💰 Monthly Income<br/>Set by user"]
    Savings["🏦 Savings Target<br/>Set by user"]
    
    Calc["📐 Calculate Margin"]
    
    Margin["✨ Your Margin<br/>Income - Savings = Spend"]
    
    SMS["📨 SMS Transactions"]
    Categorise["🏷️ Auto-Categorise"]
    Track["📊 Track Spending"]
    
    Spending["💸 Current Spending"]
    Budget["📈 Budget Check"]
    
    Income -->|Input| Calc
    Savings -->|Input| Calc
    Calc -->|Output| Margin
    
    SMS -->|Capture| Categorise
    Categorise -->|Store| Track
    Track -->|Aggregate| Spending
    Margin -->|Limit| Budget
    Spending -->|Compare| Budget
    Budget -->|Alert| User["👤 User Notified"]

    style Income fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    style Savings fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    style Margin fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    style Spending fill:#F44336,stroke:#333,stroke-width:2px,color:#fff
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite, Tailwind, SCSS | UI/UX for spending dashboard & chat |
| **Backend** | FastAPI, Python 3.11, JWT | REST API, business logic, auth |
| **Database** | MySQL 8.0 | Persistent storage |
| **Chat AI** | Qwen2.5-7B (HuggingFace) | Natural language financial answers |
| **Fallback** | Groq llama-3.1-8b | Backup LLM if HF unavailable |
| **NLP** | DistilBERT (zero-shot) | Transaction categorization |
| **SMS** | Custom regex + keyword map | Parse bank messages |

## Deployment Status

| Component | Status |
|-----------|--------|
| Backend API | ✅ Complete |
| Database Schema | ✅ Complete |
| Frontend UI | ✅ Complete |
| AI Chat (Qwen + Fallback) | ✅ Complete |
| SMS NLP Pipeline | ✅ Complete |
| Income Page | ✅ Complete |
| Production Deployment | 🔜 Coming soon |
| Android SMS Bridge | 🔜 Coming soon |

## Language Composition

```mermaid
pie title Margin AI Codebase
    "JavaScript" : 75
    "Python" : 20.6
    "CSS" : 4.1
    "Other" : 0.3
```

---

**Built by**: Shriya Shetty · Finance Student  
**Repository**: [shetty30/margin_ai](https://github.com/shetty30/margin_ai)
