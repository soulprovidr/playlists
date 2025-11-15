type Job = () => Promise<void> | void;

interface JobOptions {
  onSuccess?: (jobId: string) => void;
  onError?: (jobId: string, error: Error) => void;
}

export class JobQueue {
  private queue: Array<{ id: string; job: Job; options?: JobOptions }> = [];
  private processing = false;
  private jobIdCounter = 0;

  /**
   * Add a job to the queue
   * @param job - The function to execute
   * @param options - Optional callbacks for success/error handling
   * @returns The job ID
   */
  add(job: Job, options?: JobOptions): string {
    const jobId = this.generateJobId();
    this.queue.push({ id: jobId, job, options });

    // Start processing if not already running
    if (!this.processing) {
      this.process().catch((error) => {
        console.error("Job queue processing error:", error);
      });
    }

    return jobId;
  }

  /**
   * Process all jobs in the queue
   */
  private async process(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;

      const { id, job, options } = item;

      try {
        await job();
        options?.onSuccess?.(id);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`Job ${id} failed:`, err);
        options?.onError?.(id, err);
      }
    }

    this.processing = false;
  }

  /**
   * Get the number of jobs currently in the queue
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if the queue is currently processing
   */
  isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Clear all pending jobs from the queue
   */
  clear(): void {
    this.queue = [];
  }

  private generateJobId(): string {
    this.jobIdCounter++;
    return `job_${Date.now()}_${this.jobIdCounter}`;
  }
}
