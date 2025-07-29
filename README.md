# 🚀 Data Alchemist: AI-Powered Resource Allocation Configurator

> Transform messy spreadsheets into clean, validated, and AI-enhanced data configurations for resource allocation systems.

## ✨ Features Overview

### 🎯 **Milestone 1: Data Ingestion, Validation & AI Search** ✅
- **Smart File Upload**: Drag & drop CSV/XLSX files for clients, workers, and tasks
- **Interactive Data Grids**: Edit data inline with real-time validation
- **Comprehensive Validation**: 8+ validation types with detailed error reporting
- **AI-Powered Search**: Natural language queries to find and filter data
- **Error Highlighting**: Click errors to highlight problematic rows in grids

### 🎯 **Milestone 2: Rule Builder & Prioritization** ✅
- **Natural Language Rule Creation**: Describe rules in plain English
- **Advanced Rule Types**: Co-run, slot restrictions, load limits, phase windows, patterns
- **Multiple Prioritization Methods**: Sliders, drag-and-drop ranking, pairwise comparison
- **Preset Profiles**: Quick setup with predefined optimization strategies
- **Rule Export**: Download clean JSON configurations

### 🎯 **Milestone 3: Stretch Goals & AI Enhancements** ✅
- **Natural Language Data Modification**: AI-powered data editing with natural language commands
- **AI Rule Recommendations**: Smart suggestions based on data patterns and relationships
- **AI-based Error Correction**: Automatic fix suggestions with confidence levels
- **AI-based Validator**: Enhanced validation with AI insights and recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- OpenAI API key (for AI features)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd data_alchemist_full

# Install dependencies
npm install

# Set up environment variables
echo "OPENAI_API_KEY=your-api-key-here" > .env.local

# Start development server
npm run dev
```

### Usage
1. **Upload Data**: Drag CSV/XLSX files containing clients, workers, and tasks
2. **Validate & Edit**: Review validation errors and fix data issues inline
3. **Search**: Use natural language to find specific data
4. **Create Rules**: Describe business rules in plain English
5. **Set Priorities**: Choose optimization strategy and weights
6. **Export**: Download clean data and configuration files

## 📊 Data Structure

### Clients
```csv
ClientID,ClientName,PriorityLevel,RequestedTaskIDs,GroupTag,AttributesJSON
C1,Acme Corp,5,"T1,T2",Alpha,"{"location":"US"}"
```

### Workers
```csv
WorkerID,WorkerName,Skills,AvailableSlots,MaxLoadPerPhase,WorkerGroup,QualificationLevel
W1,Alice,"frontend,react","[1,2,3]",2,A,5
```

### Tasks
```csv
TaskID,TaskName,Category,Duration,RequiredSkills,PreferredPhases,MaxConcurrent
T1,Build UI,Frontend,2,"frontend","[1,2]",2
```

## 🔍 AI Features

### Natural Language Search
- "Find all tasks with duration more than 1 phase"
- "Show workers with frontend skills"
- "High priority clients"
- "Tasks that prefer phase 2"

### Natural Language Rules
- "Tasks T1 and T2 must co-run"
- "Workers in group A max 2 slots per phase"
- "Task T3 only in phases 1-3"
- "High priority clients get precedence"

### Natural Language Data Modification
- "Increase priority of all clients in group Alpha by 1"
- "Add frontend skill to all workers"
- "Set duration of all UI tasks to 2 phases"
- "Change all high priority clients to priority 5"

### AI Rule Recommendations
- Analyzes data patterns and relationships
- Suggests co-run rules for frequently paired tasks
- Identifies overloaded workers and suggests load limits
- Recommends precedence rules based on priority patterns

### AI Error Correction
- Suggests fixes for validation errors
- Provides confidence levels for each suggestion
- Offers alternative solutions when available
- Explains reasoning behind each correction

## 🎨 UI Features

- **Modern Design**: Clean, professional interface with gradient headers
- **Responsive Layout**: Works on desktop and mobile devices
- **Interactive Grids**: Click-to-edit data with keyboard navigation
- **Real-time Feedback**: Instant validation and error highlighting
- **Tab Navigation**: Organized sections for different features
- **Milestone 3 Tab**: Dedicated section for advanced AI features
- **AI-Powered Components**: Specialized interfaces for data modification, recommendations, and error correction

## ✅ Validation Features

### Core Validations (8+ implemented)
1. **Duplicate IDs**: Ensures unique ClientID, WorkerID, TaskID
2. **Range Validation**: Priority levels 1-5, durations ≥ 1
3. **Reference Validation**: Requested tasks must exist
4. **JSON Validation**: Valid JSON in AttributesJSON fields
5. **Phase Format**: Valid phase lists and ranges
6. **Skill Coverage**: All required skills covered by workers
7. **Load Validation**: Workers not overloaded
8. **Cross-reference**: Data integrity across entities

### AI-Enhanced Validations
- **Pattern Detection**: Identifies data anomalies
- **Smart Suggestions**: Recommends fixes for common issues
- **Contextual Validation**: Understands business rules

## ⚖️ Prioritization Methods

### 1. Sliders
- Visual weight adjustment for each criterion
- Real-time feedback on changes

### 2. Drag & Drop Ranking
- Intuitive priority ordering
- Automatic weight calculation

### 3. Pairwise Comparison Matrix
- Analytic Hierarchy Process (AHP)
- Systematic criterion comparison

### 4. Preset Profiles
- **Maximize Fulfillment**: Focus on task completion
- **Fair Distribution**: Balance workload across workers
- **Minimize Workload**: Optimize for efficiency
- **Cost Optimized**: Reduce resource usage
- **Balanced**: Equal weight distribution

## 📤 Export Options

### Formats
- **Single JSON**: Complete configuration in one file
- **Multiple CSV**: Separate files for each data type
- **ZIP Archive**: All files bundled together

### Content
- Clean, validated data
- Business rules configuration
- Prioritization weights
- Metadata and timestamps

## 🛠️ Technical Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Custom CSS with modern techniques (Grid, Flexbox, CSS Variables)
- **AI Integration**: OpenAI GPT-4
- **File Processing**: XLSX, react-dropzone
- **Data Export**: JSZip for multi-file exports

## 📁 Project Structure

```
data_alchemist/
├── 📁 components/           # React components
│   ├── AIErrorCorrection.tsx    # AI-powered error correction interface
│   ├── AIRecommendations.tsx    # AI rule recommendations panel
│   ├── DataGrid.tsx             # Interactive data grid component
│   ├── DataModifier.tsx         # Natural language data modification
│   ├── ExportPanel.tsx          # Export configuration and options
│   ├── PriorityPanel.tsx        # Prioritization methods and weights
│   ├── RuleEditor.tsx           # Natural language rule creation
│   ├── SearchPanel.tsx          # AI-powered search interface
│   ├── Upload.tsx               # File upload and processing
│   └── ValidatorPanel.tsx       # Data validation and error display
│
├── 📁 pages/                # Next.js pages and API routes
│   ├── _app.tsx             # App wrapper and global styles
│   ├── index.tsx            # Main application page
│   └── 📁 api/              # Backend API endpoints
│       ├── ai-error-correction.ts    # AI error correction API
│       ├── ai-recommendations.ts     # AI recommendations API
│       ├── nlp-modify.ts             # Natural language modification API
│       ├── nlp-rule.ts               # Natural language rule creation API
│       └── nlp-search.ts             # Natural language search API
│
├── 📁 public/               # Static assets
│   └── 📁 samples/          # Sample data files
│       ├── clients.csv       # Sample client data
│       ├── tasks.csv         # Sample task data
│       └── workers.csv       # Sample worker data
│
├── 📁 styles/               # Styling files
│   └── globals.css          # Global CSS with custom styling
│
├── 📁 utils/                # Utility functions and helpers
│   ├── aiErrorCorrection.ts # AI error correction logic
│   ├── aiRecommendations.ts # AI recommendations engine
│   ├── nlpModify.ts         # Natural language modification
│   ├── nlpSearch.ts         # Natural language search
│   ├── nlpToRule.ts         # Convert natural language to rules
│   ├── parseHeaders.ts       # CSV/Excel header parsing
│   └── validateData.ts      # Data validation logic
│
├── package.json             # Dependencies and scripts
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── README.md               # This file
```

### 📋 Key Files Explained

#### **Components** (`/components/`)
- **AIErrorCorrection.tsx**: Interface for AI-powered error correction with confidence levels
- **AIRecommendations.tsx**: Panel for AI-generated rule and data recommendations
- **DataGrid.tsx**: Interactive table component for editing data inline
- **DataModifier.tsx**: Natural language interface for modifying data
- **ExportPanel.tsx**: Export configuration with multiple format options
- **PriorityPanel.tsx**: Prioritization methods (sliders, drag-drop, pairwise)
- **RuleEditor.tsx**: Natural language rule creation interface
- **SearchPanel.tsx**: AI-powered search with natural language queries
- **Upload.tsx**: Drag-and-drop file upload with validation
- **ValidatorPanel.tsx**: Data validation display with error highlighting

#### **API Routes** (`/pages/api/`)
- **ai-error-correction.ts**: Handles AI error correction requests
- **ai-recommendations.ts**: Processes AI recommendation queries
- **nlp-modify.ts**: Natural language data modification API
- **nlp-rule.ts**: Converts natural language to business rules
- **nlp-search.ts**: Natural language search functionality

#### **Utils** (`/utils/`)
- **aiErrorCorrection.ts**: Core logic for AI error correction
- **aiRecommendations.ts**: AI recommendation engine implementation
- **nlpModify.ts**: Natural language data modification logic
- **nlpSearch.ts**: Search query processing and execution
- **nlpToRule.ts**: Rule conversion from natural language
- **parseHeaders.ts**: CSV/Excel file header processing
- **validateData.ts**: Comprehensive data validation rules

#### **Sample Data** (`/public/samples/`)
- **clients.csv**: Example client data with priority levels and attributes
- **workers.csv**: Sample worker data with skills and availability
- **tasks.csv**: Example task data with requirements and preferences

## 🎯 Use Cases

### For Non-Technical Users
- **Simple Upload**: Just drag and drop your spreadsheets
- **Natural Language**: Describe what you want in plain English
- **Visual Feedback**: See errors highlighted and explained
- **One-Click Export**: Get clean files ready for downstream systems

### For Data Analysts
- **Advanced Validation**: Comprehensive data quality checks
- **Flexible Rules**: Create complex business logic
- **Multiple Export Formats**: Choose the right format for your needs
- **AI Assistance**: Get smart suggestions and recommendations

## 🔧 Configuration

### Environment Variables
```bash
OPENAI_API_KEY=your-openai-api-key
```

### Customization
- Modify validation rules in `utils/validateData.ts`
- Add new rule types in `components/RuleEditor.tsx`
- Customize prioritization criteria in `components/PriorityPanel.tsx`

## 📈 Performance

- **Real-time Validation**: Instant feedback on data changes
- **Efficient Search**: AI-powered queries with fallback to rule-based search
- **Optimized Rendering**: Virtual scrolling for large datasets
- **Smart Caching**: Reduces API calls and improves responsiveness

---

