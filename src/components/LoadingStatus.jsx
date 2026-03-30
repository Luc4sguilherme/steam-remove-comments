import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React from 'react';

const LoadingStatus = ({ message }) => (
  <Box>
    <Text color="cyan">
      <Spinner type="dots" />
    </Text>
    <Text> {message}</Text>
  </Box>
);

export default LoadingStatus;
