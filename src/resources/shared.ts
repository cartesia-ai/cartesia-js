// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

/**
 * Phoneme-level timing information.
 */
export interface PhonemeTimestamps {
  /**
   * End times in seconds for each phoneme.
   */
  end: Array<number>;

  /**
   * List of phonemes in order.
   */
  phonemes: Array<string>;

  /**
   * Start times in seconds for each phoneme.
   */
  start: Array<number>;
}

/**
 * Word-level timing information.
 */
export interface WordTimestamps {
  /**
   * End times in seconds for each word.
   */
  end: Array<number>;

  /**
   * Start times in seconds for each word.
   */
  start: Array<number>;

  /**
   * List of words in order.
   */
  words: Array<string>;
}
