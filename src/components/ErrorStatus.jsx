import { Box, Text } from 'ink';
import React from 'react';

const ErrorStatus = ({ message }) => (
  <Box>
    <Text color="red">✖ {message}</Text>
  </Box>
);

export default ErrorStatus;
