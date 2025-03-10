import { LightningElement ,track,api,wire} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import loadDataSample from '@salesforce/apex/sampleReciviedProcessing.loadDataSample';
import getLatestData from '@salesforce/apex/sampleReciviedProcessing.getLatestData';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

const columns = [
    { label: 'Collaborator', fieldName: 'Collaboration_Key__c', editable: true },
	{ label: 'Project Name', fieldName: 'Product__c', editable: true, },
	{ label: 'Shipment', fieldName: 'Recivied_Date__c', editable: true, },
	{ label: 'Num Samples', fieldName: 'Quantity__c', editable: true },
    {
        type: 'button-icon',
        label: 'Action',
        typeAttributes: { iconName: 'utility:delete' },
        cellAttributes: { alignment: 'left'},
    },]
export default class SampleReciviedLwc extends LightningElement {
    error;
    isLoaded = false;
    data;
    columns = columns;
    @track pageSize;
    @track pageNumber;
    currentPage =1
    @track totalRecords;
    @api recordSize = 100;
    @track totalPage = 20;
    @track visibleRecords =[];
    @track isvalidData;
    @track setOfKey =[];
    refreshData;
    rowOffset = 0;
    fldsItemValues = [];
    get acceptedFormats() {
        return ['.csv'];
    }

    uploadFileHandler(event) {

        this.isLoaded = true;
        const uploadedFiles = event.detail.files;
        loadDataSample( { contentDocumentId : uploadedFiles[0].documentId,loadpageSize:this.pageSize,loadpageNumber:this.pageNumber} )
        .then( result => {
            this.isLoaded = false;
            var resultData = JSON.parse(result.jsonDT);
            this.setOfKey = result.keySet;
            this.totalRecords = resultData.smplerecivedlst;
            this.visibleRecords = this.totalRecords.slice(0, this.recordSize);
            if(this.visibleRecords.length > 0){
                this.isvalidData = true;

                this.dispatchEvent(
                    new ShowToastEvent( {
                        title: 'Successfull!',
                        message: 'File Uploaded Sucessfully',
                        variant: 'success',
                        mode: 'dismissible'
                    } ),
                );
            }else{
                this.isvalidData = false;
                this.dispatchEvent(
                    new ShowToastEvent( {
                        title: 'Warning!',
                        message: 'Data is Invalid',
                        variant: 'warning',
                        mode: 'dismissible'
                    } ),
                );
            }

        })
        .catch( error => {

            this.isLoaded = false;
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent( {
                    title: 'Error!!',
                    message: 'Data is Invalid',
                    variant: 'error',
                    mode: 'sticky'
                } ),
            );     

        } )

    }
    get records(){
        return this.visibleRecords
    }

    getUpdatedRecords()
    {
        getLatestData({ keySet: this.setOfKey })
            .then(result => {
                this.isLoaded = false;
                var resultData = JSON.parse(result);
                this.totalRecords = resultData;
                this.updateRecords();
            })
            .catch(error => {
                this.isLoaded = false;
            });
    }
    
    delRecord(event){
        var listofrecords = this.visibleRecords;
        listofrecords.splice(this.visibleRecords.findIndex(row => row.Id === event.detail.row.Id), 1);
        this.totalRecords.splice(this.totalRecords.findIndex(row => row.Id === event.detail.row.Id), 1);
        this.visibleRecords=[];
        this.visibleRecords=listofrecords;

        this.updateRecords()
        this.dispatchEvent(
            new ShowToastEvent( {
                title: 'Successfull!',
                message: 'Row delete Sucessfully',
                variant: 'success',
                mode: 'dismissible'
            } ),
        );
        
    }
    get disablePrevious(){ 
        return this.currentPage<=1
    }
    get disableNext(){ 
        return this.currentPage>=this.totalPage
    }
    previousHandler(){ 
        this.rowOffset -= 100;
        if(this.currentPage>1){
            this.currentPage = this.currentPage-1;
            this.updateRecords();
        }
    }
    nextHandler(){
        this.rowOffset += 100;
        if(this.currentPage < this.totalPage){
            this.currentPage = this.currentPage+1;
            this.updateRecords();
        }
    }
    updateRecords(){ 
        const start = (this.currentPage-1)*this.recordSize;
        const end = this.recordSize*this.currentPage;
        this.visibleRecords = this.totalRecords.slice(start, end);
        this.dispatchEvent(new CustomEvent('update',{ 
            detail:{ 
                records:this.visibleRecords
            }
        }))
    }
    UploadCompleteandler(event){
        try{
            this.isLoaded = true;
            
            const inputsItems = this.fldsItemValues.slice().map(draft => {
                const fields = Object.assign({}, draft);
                return { fields };
            });
    
            const promises = inputsItems.map(recordInput => updateRecord(recordInput));

            Promise.all(promises).then(res => {
                this.isLoaded = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Records Updated Successfully!!',
                        variant: 'success'
                    })
                );
                this.fldsItemValues = [];
                return this.getUpdatedRecords()
            }).catch(error => {
                this.isLoaded = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'An Error Occured!!',
                        variant: 'error'
                    })
                );
            }).finally(() => {
                this.fldsItemValues = [];
            });
        }
        catch (error){
            console.error(error);
        }
    }

        saveHandleAction(event) 
        {
            this.fldsItemValues = event.detail.draftValues;
            console.log('this.fldsItemValues--->'+JSON.stringify(this.fldsItemValues));            
        }
    async refresh() {
        await refreshApex(this.visibleRecords);
    }
    }