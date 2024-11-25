import { LightningElement,track } from 'lwc';
import saveJobSeeker from '@salesforce/apex/jobSearchController.submitJobseekerData';
import uploadFile from '@salesforce/apex/jobSearchController.uploadFile';
import sendSMS from '@salesforce/apex/sendMessage.sendTextMessage';

export default class JobSeeker extends LightningElement {
    
    showSpinner=false;
    jobSeekerId;
    name;
    fileData;
    firstName = '';
    lastName = '';
    email = '';
    phone;
    description = '';
    @track form={};
    @track recordId;
    uploadedFiles = []; file; fileContents; fileReader; content; fileName;

    // Handles input change
    handleInputChange(event) {
        let { name, value } = event.target;
        this.form[name] = value;
        console.log("formData:", JSON.stringify(this.form));
    }

    handleResumeChange(event) {
        const file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = () => {
          var base64 = reader.result.split(",")[1];
          this.fileData = {
            filename: file.name,
            base64: base64
          };
          console.log(this.fileData, "file");
        };
        reader.readAsDataURL(file);
      }

    // Handles form submission and uplaod the file
      handleSubmit() {
        this.showSpinner = true;
        console.log('inside');
        
             saveJobSeeker({ jobSeeker: JSON.stringify(this.form)})
            .then(async (data) => {
              console.log('data',data);
              this.jobSeekerId = data.Id;
              this.phone=data.Phone__c;
              this.name=data.First_Name__c;
              if(this.fileData){
                const { base64, filename } = this.fileData;
                await uploadFile({base64:base64,filename:filename,recordId:this.jobSeekerId}).then(async (res)=>{
                    console.log('res',res);
                    await sendSMS({toPhoneNumber:this.phone,messageBody:this.name+''+'Details Submitted'}).then(ress=>{
                      console.log('numbe,msg',this.phone);
                      
                      console.log('res1',ress);
                    }).catch(error => {
                      console.log('err1',error);
                      
                    });
                    this.clearForm();
                   // this.sendSMS({toPhoneNumber:this.phone,messageBody:this.name+'Details Submitted'});
                   
                }).catch(error=>{
                    console.log('Error',JSON.stringify(error));
                    
                })


              }
             
            })
            
            .catch(error => {
                console.log('error',JSON.stringify(error));
                
            });
            
    }
    
    clearForm(){
      console.log('clearing');
      
      this.form={
              First_Name__c:'',
          Last_Name__c:'',
          Email__c:'',
          Phone__c:'',
          Description__c:''
      };
      this.fileData=null;
      this.template.querySelectorAll('lightning-input').forEach(element => {
        element.value='';
      });
      const fileInput = this.template.querySelector('input[type="file"]');
      fileInput.value='';
   }  
}
