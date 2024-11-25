public without sharing class jobSearchController {
    
        @AuraEnabled
        public static JobSeeker__c submitJobseekerData(String jobSeeker) {
            System.debug('jobSeeker'+jobSeeker);
            JobSeeker__c js = (JobSeeker__c)JSON.deserialize(jobSeeker,JobSeeker__c.class);
            System.debug('js'+js);
            insert js;
            return js;
           
        }

        @AuraEnabled
        public static String uploadFile(String base64, String filename, Id recordId) {
          ContentVersion cv = createContentVersion(base64, filename);
          List<ContentVersion> cvRec = new List<ContentVersion>();
          //Map<Id, ContentVersion> cvMap = new Map<Id, ContentVersion>();
          // cvMap.put(cv.Id,cv);
          ContentDocumentLink cdl = createContentLink(cv.Id, recordId);
          cvRec = [
            SELECT Id, ContentDocumentId, FileType, Title
            FROM ContentVersion
            WHERE id = :cv.Id
          ];
          if (cv == null || cdl == null) {
            return null;
          }
          return cdl.Id;
        }
      
        private static ContentVersion createContentVersion(String base64,String filename) {
          ContentVersion cv = new ContentVersion();
          cv.VersionData = EncodingUtil.base64Decode(base64);
          cv.Title = filename;
          cv.PathOnClient = filename;
          cv.SharingPrivacy = 'N';
          try {
            insert cv;
            return cv;
          } catch (DMLException e) {
            System.debug(e);
            return null;
          }
        }
        private static ContentDocumentLink createContentLink(String contentVersionId,String recordId) {
          if (contentVersionId == null) {
            return null;
          }
          ContentDocumentLink cdl = new ContentDocumentLink();
          cdl.ContentDocumentId = [
            SELECT ContentDocumentId
            FROM ContentVersion
            WHERE Id = :contentVersionId
          ]
          .ContentDocumentId;
      
          cdl.LinkedEntityId = recordId;
      
          // ShareType is either 'V', 'C', or 'I'
          // V = Viewer, C = Collaborator, I = Inferred
          cdl.ShareType = 'V';
          try {
            insert cdl;
            return cdl;
          } catch (DMLException e) {
            System.debug(e);
            return null;
          }
        }
    }
