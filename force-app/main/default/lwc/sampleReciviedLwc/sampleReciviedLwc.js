import { LightningElement , wire} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import loadData from '@salesforce/apex/sampleReciviedProcessing.loadDataSample';
import updateSample from '@salesforce/apex/sampleReciviedProcessing.updateSample'; 

const columns = [
    { label: 'Recivied Date', fieldName: 'Recivied_Date__c', editable: true },
    { label: 'Quantity', fieldName: 'Quantity__c', editable: true },
    { label: 'Product', fieldName: 'Product__c', editable: true },
    { label: 'Collaboration Key', fieldName: 'Collaboration_Key__c', editable: true },

];

export default class SampleReciviedLwc extends LightningElement {
    error;
    isLoaded = false;

    data;
    columns = columns;
    rowOffset = 0;
    filename;
    draftValues = [];


    error;


    get acceptedFormats() {
        return ['.csv'];
    }
    
    uploadFileHandler( event ) {

        this.isLoaded = true;
        const uploadedFiles = event.detail.files;
        loadData( { contentDocumentId : uploadedFiles[0].documentId } )
        .then( result => {
            this.isLoaded = false;
            window.console.log('result ===> '+result);
            //this.strMessage = result;
           // this.data = result;
            let tempRecords = JSON.parse( JSON.stringify( result ) );
          /*  tempRecords = tempRecords.map( row => {
                return { ...row, Collaboration_Opportunity__c: row.Collaboration_Opportunity__r.Name };
            })*/
            this.data = tempRecords;
            this.dispatchEvent(
                new ShowToastEvent( {
                    title: 'File Uploaded Sucessfully',
                    message: result,
                  //  variant: result.includes("success") ? 'success' : 'error',
                    variant: 'success',
                    mode: 'sticky'
                } ),
            );

        })
        .catch( error => {

            this.isLoaded = false;
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent( {
                    title: 'Error!!',
                    message: JSON.stringify( error ),
                    variant: 'error',
                    mode: 'sticky'
                } ),
            );     

        } )

    }
    testMethod(){
        alert('click');
    }
  /*  @wire( fetchAccounts )  
    wiredAccount( value ) {

        this.wiredRecords = value; // track the provisioned value
        const { data, error } = value;

        if ( data ) {
                            
            this.records = data;
            this.error = undefined;

        } else if ( error ) {

            this.error = error;
            this.records = undefined;

        }

    }  
*/
     async handleSave(event) {
        const updatedFields = event.detail.draftValues;
        console.log('Insert'+JSON.stringify(updatedFields));
        console.log('Insert'+event.detail);
        const notifyChangeIds = updatedFields.map(row => { return { "recordId": row.Id } });
        try {
            console.log('Insert'+JSON.stringify(updatedFields));
            const result = await updateSample({data: updatedFields});
          //  const result = await updateBatch({data: event.detail});
            
            console.log(JSON.stringify("Apex update result: "+ result));
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record updated',
                    variant: 'success'
                })
            );
    
            // Refresh LDS cache and wires
          //  getRecordNotifyChange(notifyChangeIds);
    
            // Display fresh data in the datatable
            refreshApex(this.contact).then(() => {
                // Clear all draft values in the datatable
                this.draftValues = [];
            });
        } catch(error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or refreshing records',
                    message: error.body.message,
                    variant: 'error'
                })
          );
     };


    }
}