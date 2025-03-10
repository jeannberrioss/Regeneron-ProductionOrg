/*Description : - Get Sample recieved Date on Batch object based on Sample Received
  Author : - Sunny/Ramya
  Date Created : - 01/16/2025
 */

public class BatchSampleReceivedHandler {
    Public static void sampleRecieved(List<Sample_Received_Stage__c> sampleRecords){
        System.debug('Triggered');
       if (sampleRecords == null || sampleRecords.isEmpty()) {
            return; 
        }
        //Get Related Opportunity
        Set<Id> OpportunityID = new Set<Id>();
        if(sampleRecords!=null){
        for(Sample_Received_Stage__c SR : sampleRecords){
            OpportunityID.add(SR.Collaboration_Opportunity__c);
        }}
        //Get All the Batches related to Opportunity
        List<Batch__c> BatchList = [Select id,Collaboration_Opportunity__c,CreatedDate,name,Forecasted_Number_of_Samples__c 
                                   from Batch__c 
                                   where Collaboration_Opportunity__c IN: OpportunityID 
                                   ORDER BY CreatedDate ];
        Map<Integer,Decimal> BatchQuantityMap = new Map<Integer,Decimal>();
        Map<Integer,Id> BatchIDMap = new Map<Integer,Id>();
        Decimal Sum = 0;
        Integer Count = 0;
        if(BatchList != null){
        for(Batch__c bt: BatchList ){
            Count++;
            if(bt.Forecasted_Number_of_Samples__c !=null){
            	Sum = bt.Forecasted_Number_of_Samples__c + Sum;
            	BatchQuantityMap.put(Count,Sum);
            	BatchIDMap.put(Count,bt.Id);
            }
        }}
        Integer Counter2=0;
        Map<Integer,Decimal> SampleRMap = new Map<Integer,Decimal>();
        Map<Integer,Date> SRDateMap = new Map<Integer,Date>();
        List<Sample_Received_Stage__c> SampleReceivedList = [Select id,Collaboration_Opportunity__c,Recivied_Date__c,Quantity__c 
                                                             from Sample_Received_Stage__c 
                                                             where Collaboration_Opportunity__c IN : OpportunityID 
                                                             ORDER BY Recivied_Date__c ];
        Decimal SumSR = 0;
        For(Sample_Received_Stage__c sr: SampleReceivedList)   {
            Counter2++;
            if(sr.Quantity__c != null){
            	SumSR = SumSR + sr.Quantity__c;
            	SampleRMap.put(Counter2,SumSR);
            	SRDateMap.put(Counter2,sr.Recivied_Date__c);
            }
        } 
        
        //Comparing Batch Quantities and Sample received Quantities and capturing in Map 
        Map<Id,Date> FinalMap = new Map<Id,Date>();
        for (integer sr :SampleRMap.keySet() ){
            for(integer b :BatchQuantityMap.keySet()){
                if(SampleRMap.get(sr) >= BatchQuantityMap.get(b)){
                    if(!FinalMap.containsKey(BatchIDMap.get(b))){
                        FinalMap.put(BatchIDMap.get(b),SRDateMap.get(sr));
                      } 
                 } 
             }
        }    
        for(Integer i : BatchIDMap.keySet()){
            if(!FinalMap.containsKey(BatchIDMap.get(i))){
                        FinalMap.put(BatchIDMap.get(i),null);
                      } 
            
        }
          
        List<Batch__c> BatchrecordsToUpdate = new List<Batch__c>();
        for(Batch__c  b : BatchList){
            if(FinalMap.containsKey(b.Id)){
                b.Date_Samples_Received__c = FinalMap.get(b.Id);
                if(Finalmap.get(b.Id)!= null){
                    b.Received__c = true;
                }
                Else {
                    b.Received__c = false;
                }
                
                BatchrecordsToUpdate.add(b)  ;            
            }
         }
        
        //Updating Batches
        if (!BatchrecordsToUpdate.isEmpty()) {
            try {
                update BatchrecordsToUpdate;
            } catch (DmlException ex) {
                System.debug('Error updating Batch records: ' + ex.getMessage());
            }
        }
      }
}