@isTest
public class BatchSampleReceivedHandlerTest {
    @testSetup
    static void setupTestData() {
        
        Opportunity testOpportunity = new Opportunity(
            Name = 'Test Opportunity',
            StageName = 'Prospecting',
            CloseDate = Date.today()
        );
        insert testOpportunity;

        
        List<Batch__c> batchList = new List<Batch__c>();
        for (Integer i = 0; i < 3; i++) {
            batchList.add(new Batch__c(
                Name = 'Batch ' + i,
                Collaboration_Opportunity__c = testOpportunity.Id,
                Forecasted_Number_of_Samples__c = 10
            ));
        }
        insert batchList;

      
        List<Sample_Received_Stage__c> sampleList = new List<Sample_Received_Stage__c>();
        for (Integer i = 0; i < 3; i++) {
            sampleList.add(new Sample_Received_Stage__c(
                Collaboration_Opportunity__c = testOpportunity.Id,
                Recivied_Date__c = Date.today().addDays(i),
                Quantity__c = 10
            ));
        }
        insert sampleList;
    }

    @isTest
    static void testSampleReceived() {
       
        List<Sample_Received_Stage__c> testSamples = [SELECT Id, Collaboration_Opportunity__c FROM Sample_Received_Stage__c];
        List<Batch__c> testBatches = [SELECT Id, Date_Samples_Received__c, Received__c FROM Batch__c];

        Test.startTest();
        BatchSampleReceivedHandler.sampleRecieved(testSamples);
        Test.stopTest();

        List<Batch__c> updatedBatches = [SELECT Id, Date_Samples_Received__c, Received__c FROM Batch__c];
        System.assertEquals(3, updatedBatches.size(), 'All batches should be updated');
        for (Batch__c b : updatedBatches) {
            System.assertNotEquals(null, b.Date_Samples_Received__c, 'Date_Samples_Received__c should be set');
            System.assertEquals(true, b.Received__c, 'Received__c should be true');
        }
    }
}