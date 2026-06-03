

- **Approval flow should be 3-step**:
    
    1. **Auditor confirms first**
        
    2. **Agent confirms**
        
    3. **Team lead confirms**
        
- **System-generated values first**
    
    - System calculates commission numbers first
        
    - Radius fee is system-calculated and not meant to be freely editable in the normal flow
        
- **Naming change**
    
    - Don’t call agent/team actions “approval”
        
    - Krish said to call them **“confirm”** instead
        
- **If auditor changes anything later**
    
    - Prior confirmations from agent/team lead should effectively become invalid and need reconfirmation
- **CDA should appear only closer to closing**
    
    - Auditor action happens closer to **close of escrow**
        
    - CDA-related controls should not be shown too early
        
- **Generate CDA button**
    
    - Krish said the current **Generate CDA** idea is wasteful
        
    - Prefer a more direct **Download CDA** flow once everything is confirmed
        
- **Visibility / page state**
    
    - CDA calculations page/link should exist
        
    - Before it becomes active, better to **show it disabled** rather than hide it completely
        
- **Locking after finalization**
    
    - Once CDA is generated/finalized, previous deal edits should be locked
- **Need historical tracking**
    
    - Show confirmation history / status progression across auditor, agent, and team lead
- **Push notification flow**
    
    - After auditor verifies, push notification/event should go to agent/team so they can review and confirm
- **Editability**
    
    - Some values are system-derived, but final fee numbers can still be edited in the file if needed depending on team workflow
- **Edge case discussed**
    
    - If a prior transaction is cancelled, downstream number recalculation needs to be handled carefully
        
    - Krish’s direction was essentially: after close / final confirmation, don’t keep recalculating historical finalized CDA states