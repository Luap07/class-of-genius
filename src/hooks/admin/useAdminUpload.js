import { useState } from "react";

import {
  uploadMediaFile,
  createMedia
} from "../../services/admin/adminMediaService";


const useAdminUpload = () => {

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState(null);

  const [uploadedFile, setUploadedFile] = useState(null);



  const uploadFile = async (
    file,
    metadata = {}
  ) => {

    try {

      setUploading(true);

      setError(null);



      // Upload file to Supabase Storage
      const uploadResult =
        await uploadMediaFile(
          file
        );



      // Save file information in database
      const mediaRecord =
        await createMedia({

          ...metadata,

          file_url:
            uploadResult.url,

          file_path:
            uploadResult.path,

          file_name:
            file.name,

          file_type:
            file.type

        });



      setUploadedFile(
        mediaRecord
      );


      return mediaRecord;


    } catch (err) {

      setError(
        err.message
      );


      throw err;


    } finally {

      setUploading(false);

    }

  };



  return {

    uploadFile,

    uploading,

    uploadedFile,

    error

  };

};


export default useAdminUpload;