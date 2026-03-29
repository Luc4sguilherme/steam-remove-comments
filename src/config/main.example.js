export default {
  userName: '',

  passWord: '',

  sharedSecret: '',

  identitySecret: '',

  batch: 10, // Number of comments to delete concurrently per batch
  delay: 5000, // Wait time (ms) between batches to avoid rate limiting
};
