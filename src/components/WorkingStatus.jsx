import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React from 'react';

import ProgressBar from './ProgressBar.jsx';

const WorkingStatus = ({ progress }) => (
  <Box flexDirection="column" gap={0.5}>
    {progress.page !== null ? (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> Removing comments from the page {progress.page}...</Text>
      </Box>
    ) : (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> Removing comments...</Text>
      </Box>
    )}

    {progress.total > 0 && (
      <ProgressBar current={progress.current} total={progress.total} />
    )}
  </Box>
);

export default WorkingStatus;
