trigger BatchSampleReceived on Sample_Received_Stage__c (After insert,After Update) {
    if(trigger.isInsert || trigger.isUpdate){
        BatchSampleReceivedHandler.sampleRecieved(trigger.new);
    }

}