import { Box, Text } from 'ink';
import React from 'react';

const ProgressBar = ({ current, total, width = 30 }) => {
  const ratio = total > 0 ? current / total : 0;
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const percentage = Math.round(ratio * 100);

  return (
    <Box>
      <Text> </Text>
      <Text color="green">{'█'.repeat(filled)}</Text>
      <Text color="gray">{'░'.repeat(empty)}</Text>
      <Text>
        {' '}
        {current}/{total} ({percentage}%)
      </Text>
    </Box>
  );
};

export default ProgressBar;
