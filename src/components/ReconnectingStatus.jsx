import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React from 'react';

const ReconnectingStatus = ({ message }) => (
  <Box flexDirection="column">
    <Text color="red">✖ {message}</Text>
    <Box>
      <Text color="cyan">
        <Spinner type="dots" />
      </Text>
      <Text> Waiting to reconnect...</Text>
    </Box>
  </Box>
);

export default ReconnectingStatus;
