import { Box, Text } from 'ink';
import React from 'react';

const ResultStatus = ({ result }) => {
  if (result.total === 0) {
    return (
      <Box>
        <Text color="yellow">⚠ No comments found to remove.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text color="green">
        ✔ Operation completed: {result.removed}/{result.total} comment(s)
        removed successfully.
      </Text>
    </Box>
  );
};

export default ResultStatus;
