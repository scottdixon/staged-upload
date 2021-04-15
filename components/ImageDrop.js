import React, { useState } from "react";
import { DropZone, Thumbnail, Spinner } from "@shopify/polaris";
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

const COLLECTION_UPDATE = gql`
  mutation collectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection {
        id
        image {
          originalSrc
        }
      }
      job {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`  

function ImageDrop(props) {
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [collectionUpdate] = useMutation(COLLECTION_UPDATE, { onCompleted: () => setLoading(false) });

  const uploadFile = async (staged) => {
    // Prepare form
    const formData = new FormData()
    const { url, parameters } = staged.stagedUploadsCreate.stagedTargets[0]

    parameters.forEach(({name, value}) => {
      formData.append(name, value)
    });

    formData.append('file', file)

    // Upload
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const key = parameters.find(p => p.name === 'key')
      collectionUpdate({ variables: {
          "input": {
            "id": props.collectionId,
            "image": {
              "src": `${url}/${key.value}`
            }
          }
        }
      })
      // Todo: handle Shopify API errors
    } else {
      console.error('Unable to upload to S3 bucket')
      setLoading(false)
    }

  }

  const [generateUrl, { data }] = useMutation(GENERATE_URL, { onCompleted: uploadFile });

  const handleDropZoneDrop = (files) => {
    setLoading(true)
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
      { loading ? <Spinner size="large" /> : <Thumbnail source={props.collectionImage} /> }
    </DropZone>
  );
}

export default ImageDrop;
