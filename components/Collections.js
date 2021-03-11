import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
  DropZone
} from '@shopify/polaris';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';
import ImageDrop from './ImageDrop';

const GET_COLLECTIONS = gql`
  query {
    collections(first:5) {
      edges {
        node {
          id
          title
          image {
            originalSrc
          }
        }
      }
    }
  }
`;

class ResourceListWithCollections extends React.Component {
  static contextType = Context;

  render() {
    return (
      <Query query={GET_COLLECTIONS}>
        {({ data, loading, error }) => {
          if (loading) return <div>Loading…</div>;
          if (error) return <div>{error.message}</div>;
          return (
            <Card>
              <ResourceList
                resourceName={{ singular: 'Collection', plural: 'Collections' }}
                items={data.collections.edges}
                renderItem={item => {
                  const media = (
                    <ImageDrop collectionId={item.node.id} collectionImage={item.node.image ? item.node.image.originalSrc : ''} />
                  );
                  return (
                      <ResourceList.Item
                        id={item.id}
                        media={media}
                      >
                        <Stack>
                          <Stack.Item fill>
                            <h3>
                              <TextStyle variation="strong">
                                {item.node.title}
                              </TextStyle>
                            </h3>
                          </Stack.Item>
                        </Stack>
                      </ResourceList.Item>
                  );
                }}
              />
            </Card>
          );
        }}
      </Query>
    );
  }
}

export default ResourceListWithCollections;