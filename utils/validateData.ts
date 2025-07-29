export interface ValidationError {
  type: string;
  message: string;
  entity: string;
  field?: string;
  value?: any;
  row?: number;
}

export function validateData(clients: any[], workers: any[], tasks: any[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Helper functions
  const addError = (type: string, message: string, entity: string, field?: string, value?: any, row?: number) => {
    errors.push({ type, message, entity, field, value, row });
  };

  const checkDuplicates = (data: any[], idField: string, entityName: string) => {
    const seen = new Set();
    data.forEach((item, index) => {
      if (seen.has(item[idField])) {
        addError('duplicate', `Duplicate ${idField}`, entityName, idField, item[idField], index);
      }
      seen.add(item[idField]);
    });
  };

  const parseJSON = (str: string, field: string, entity: string, row: number) => {
    try {
      return JSON.parse(str);
    } catch {
      addError('malformed', `Invalid JSON in ${field}`, entity, field, str, row);
      return null;
    }
  };

  const parsePhaseList = (str: string): number[] => {
    if (!str) return [];
    try {
      // Handle range syntax like "1-3" or list syntax like "[1,2,3]"
      if (str.includes('-')) {
        const [start, end] = str.split('-').map(Number);
        return Array.from({length: end - start + 1}, (_, i) => start + i);
      }
      if (str.startsWith('[') && str.endsWith(']')) {
        return JSON.parse(str);
      }
      return str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    } catch {
      return [];
    }
  };

  // 1. Check for duplicate IDs
  checkDuplicates(clients, 'ClientID', 'clients');
  checkDuplicates(workers, 'WorkerID', 'workers');
  checkDuplicates(tasks, 'TaskID', 'tasks');

  // 2. Validate clients
  clients.forEach((client, index) => {
    // PriorityLevel validation
    if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
      addError('range', 'PriorityLevel must be 1-5', 'clients', 'PriorityLevel', client.PriorityLevel, index);
    }

    // RequestedTaskIDs validation
    if (client.RequestedTaskIDs) {
      const requestedTasks = String(client.RequestedTaskIDs).split(',').map(s => s.trim()).filter(Boolean);
      const taskIds = new Set(tasks.map(t => t.TaskID));
      requestedTasks.forEach(taskId => {
        if (!taskIds.has(taskId)) {
          addError('reference', `Unknown TaskID: ${taskId}`, 'clients', 'RequestedTaskIDs', taskId, index);
        }
      });
    }

    // AttributesJSON validation
    if (client.AttributesJSON) {
      parseJSON(client.AttributesJSON, 'AttributesJSON', 'clients', index);
    }
  });

  // 3. Validate workers
  workers.forEach((worker, index) => {
    // AvailableSlots validation
    if (worker.AvailableSlots) {
      const slots = parsePhaseList(worker.AvailableSlots);
      if (slots.length === 0) {
        addError('malformed', 'Invalid AvailableSlots format', 'workers', 'AvailableSlots', worker.AvailableSlots, index);
      }
      if (slots.some(slot => slot < 1)) {
        addError('range', 'AvailableSlots must be positive numbers', 'workers', 'AvailableSlots', worker.AvailableSlots, index);
      }
    }

    // MaxLoadPerPhase validation
    if (worker.MaxLoadPerPhase < 1) {
      addError('range', 'MaxLoadPerPhase must be at least 1', 'workers', 'MaxLoadPerPhase', worker.MaxLoadPerPhase, index);
    }

    // QualificationLevel validation
    if (worker.QualificationLevel < 1 || worker.QualificationLevel > 5) {
      addError('range', 'QualificationLevel must be 1-5', 'workers', 'QualificationLevel', worker.QualificationLevel, index);
    }
  });

  // 4. Validate tasks
  tasks.forEach((task, index) => {
    // Duration validation
    if (task.Duration < 1) {
      addError('range', 'Duration must be at least 1', 'tasks', 'Duration', task.Duration, index);
    }

    // PreferredPhases validation
    if (task.PreferredPhases) {
      const phases = parsePhaseList(task.PreferredPhases);
      if (phases.length === 0) {
        addError('malformed', 'Invalid PreferredPhases format', 'tasks', 'PreferredPhases', task.PreferredPhases, index);
      }
      if (phases.some(phase => phase < 1)) {
        addError('range', 'PreferredPhases must be positive numbers', 'tasks', 'PreferredPhases', task.PreferredPhases, index);
      }
    }

    // MaxConcurrent validation
    if (task.MaxConcurrent < 1) {
      addError('range', 'MaxConcurrent must be at least 1', 'tasks', 'MaxConcurrent', task.MaxConcurrent, index);
    }
  });

  // 5. Cross-reference validations
  // Check if all required skills are covered by workers
  const allWorkerSkills = new Set();
  workers.forEach(worker => {
    if (worker.Skills) {
      String(worker.Skills).split(',').map(s => s.trim()).forEach(skill => allWorkerSkills.add(skill));
    }
  });

  tasks.forEach((task, index) => {
    if (task.RequiredSkills) {
      const requiredSkills = String(task.RequiredSkills).split(',').map(s => s.trim());
      const missingSkills = requiredSkills.filter(skill => !allWorkerSkills.has(skill));
      if (missingSkills.length > 0) {
        addError('coverage', `Missing skills: ${missingSkills.join(', ')}`, 'tasks', 'RequiredSkills', missingSkills, index);
      }
    }
  });

  // 6. Check for overloaded workers
  workers.forEach((worker, index) => {
    const availableSlots = parsePhaseList(worker.AvailableSlots);
    if (availableSlots.length < worker.MaxLoadPerPhase) {
      addError('overload', `Worker has fewer available slots (${availableSlots.length}) than MaxLoadPerPhase (${worker.MaxLoadPerPhase})`, 'workers', 'AvailableSlots', worker.AvailableSlots, index);
    }
  });

  return errors;
}

export function validateDataSimple(clients: any[], workers: any[], tasks: any[]): string[] {
  const errors = validateData(clients, workers, tasks);
  return errors.map(e => `${e.entity} ${e.row !== undefined ? `(row ${e.row + 1})` : ''}: ${e.message}`);
}
