const map:Record<string,string>={
  clientid:'ClientID',clientname:'ClientName',prioritylevel:'PriorityLevel',
  requestedtaskids:'RequestedTaskIDs',grouptag:'GroupTag',attributesjson:'AttributesJSON',
  workerid:'WorkerID',workername:'WorkerName',skills:'Skills',availableslots:'AvailableSlots',
  maxloadperphase:'MaxLoadPerPhase',workergroup:'WorkerGroup',qualificationlevel:'QualificationLevel',
  taskid:'TaskID',taskname:'TaskName',category:'Category',duration:'Duration',
  requiredskills:'RequiredSkills',preferredphases:'PreferredPhases',maxconcurrent:'MaxConcurrent'
};
export function parseHeaders(rows:any[]){
  return rows.map(r=>{
    const o:any={};
    for(const [k,v] of Object.entries(r)){
      const norm=k.toLowerCase().replace(/[^a-z0-9]/g,'');
      o[map[norm]||k]=v;
    }
    return o;
  });
}
