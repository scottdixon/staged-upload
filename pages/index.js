import React, {useState, useCallback} from "react";
import { DropZone } from "@shopify/polaris";
import { withApollo } from '@apollo/react-hoc';
import { gql } from 'apollo-boost';
import { useMutation } from "react-apollo";

const GENERATE_URL = gql`
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        resourceUrl
        url
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function Index() {
  const [file, setFile] = useState();

  const uploadFile = (staged) => {
    console.log(staged)
    console.log('UPLOAD', file)
    const formData = new FormData()
    // Do the actual upload
  }
  const [generateUrl, { data }] = useMutation(GENERATE_URL, { onCompleted: uploadFile });

  const handleDropZoneDrop = (files) => {
    setFile(files[0])
    generateUrl({ variables: {
      "input": [
        {
          "resource": "COLLECTION_IMAGE",
          "filename": files[0].name,
          "mimeType": files[0].type,
          "fileSize": files[0].size.toString(),
          "httpMethod": "POST"
        }
      ]
    }})
  }

  return (
    <DropZone onDrop={handleDropZoneDrop} allowMultiple={false}>
      <DropZone.FileUpload />
    </DropZone>
  );
}

export default Index;
