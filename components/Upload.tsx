import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { parseHeaders } from '@/utils/parseHeaders';

interface Props {
  setClients: (d: any[]) => void;
  setWorkers: (d: any[]) => void;
  setTasks:   (d: any[]) => void;
  setErrors:  (e: string[]) => void;
}

export default function Upload({ setClients, setWorkers, setTasks, setErrors }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const onDrop = useCallback((files: File[]) => {
    setIsProcessing(true);
    setUploadedFiles([]);
    
    files.forEach(async (file) => {
      try {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf);
        let processedSheets = 0;
        
      wb.SheetNames.forEach(name => {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' });
        const data = parseHeaders(rows);
        const lower = name.toLowerCase();
          
          if (lower.includes('client')) {
            setClients(data);
            setUploadedFiles(prev => [...prev, `📊 ${name} (${data.length} clients)`]);
          } else if (lower.includes('worker')) {
            setWorkers(data);
            setUploadedFiles(prev => [...prev, `👥 ${name} (${data.length} workers)`]);
          } else if (lower.includes('task')) {
            setTasks(data);
            setUploadedFiles(prev => [...prev, `📋 ${name} (${data.length} tasks)`]);
          } else {
            setErrors([`Unknown sheet: ${name}`]);
            setUploadedFiles(prev => [...prev, `❓ ${name} (unknown type)`]);
          }
          processedSheets++;
        });
        
        if (processedSheets === 0) {
          setErrors(['No valid sheets found in uploaded file']);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setErrors([`Error processing ${file.name}`]);
      }
    });
    
    setTimeout(() => setIsProcessing(false), 1000);
  }, [setClients, setWorkers, setTasks, setErrors]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: true
  });

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={`upload-area ${isDragActive ? 'drag-active' : ''} ${isProcessing ? 'processing' : ''}`}
        style={isProcessing ? {pointerEvents: 'none', opacity: 0.75} : {}}
      >
      <input {...getInputProps()}/>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="upload-icon">
            {isProcessing ? '⏳' : isDragActive ? '📁' : '📤'}
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <h3 className="upload-title">
              {isProcessing ? 'Processing Files...' : isDragActive ? 'Drop Files Here' : 'Upload Your Data'}
            </h3>
            <p className="upload-description">
              {isProcessing 
                ? 'Please wait while we process your files...'
                : 'Click or drag CSV/XLSX files here to get started'
              }
            </p>
          </div>
          
          <div className="file-types">
            <span className="file-type">
              <span className="dot" style={{backgroundColor: '#10b981'}}></span>
              CSV Files
            </span>
            <span className="file-type">
              <span className="dot" style={{backgroundColor: '#3b82f6'}}></span>
              Excel Files
            </span>
            <span className="file-type">
              <span className="dot" style={{backgroundColor: '#8b5cf6'}}></span>
              Multiple Files
            </span>
          </div>
        </div>
        
        {/* Processing Animation */}
        {isProcessing && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{textAlign: 'center'}}>
              <div style={{
                width: '4rem',
                height: '4rem',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem'
              }}></div>
              <p style={{color: '#3b82f6', fontWeight: '600', fontSize: '1.125rem'}}>Processing your data...</p>
              <p style={{color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem'}}>This may take a few moments</p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files Summary */}
      {uploadedFiles.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid #bbf7d0'
        }}>
          <h4 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#166534',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{marginRight: '0.75rem', fontSize: '1.5rem'}}>✅</span>
            Successfully Processed Files
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {uploadedFiles.map((file, index) => (
              <div 
                key={index}
                style={{
                  background: 'white',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  transition: 'box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}
              >
                <div style={{fontSize: '1.5rem'}}>
                  {file.includes('clients') ? '📊' : file.includes('workers') ? '👥' : file.includes('tasks') ? '📋' : '❓'}
                </div>
                <div style={{flex: 1}}>
                  <p style={{fontWeight: '600', color: '#1e293b'}}>{file}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Data Section */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid #bfdbfe'
      }}>
        <h4 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1e40af',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{marginRight: '0.75rem', fontSize: '1.5rem'}}>💡</span>
          Need Sample Data?
        </h4>
        <p style={{color: '#1e40af', marginBottom: '1.5rem', fontSize: '1.125rem'}}>
          Try uploading the sample files included in the project to see how the system works:
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            border: '1px solid #bfdbfe',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>📊</div>
            <h5 style={{fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.125rem'}}>Clients</h5>
            <p style={{color: '#64748b'}}>Sample client data with priorities and task requests</p>
          </div>
          <div style={{
            background: 'white',
            border: '1px solid #bfdbfe',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>👥</div>
            <h5 style={{fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.125rem'}}>Workers</h5>
            <p style={{color: '#64748b'}}>Sample worker data with skills and availability</p>
          </div>
          <div style={{
            background: 'white',
            border: '1px solid #bfdbfe',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>📋</div>
            <h5 style={{fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.125rem'}}>Tasks</h5>
            <p style={{color: '#64748b'}}>Sample task data with requirements and constraints</p>
          </div>
        </div>
      </div>
    </div>
  );
}
