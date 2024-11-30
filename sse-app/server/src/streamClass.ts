export class StreamClass {
  sseStream: ReadableStream;

  constructor(sseStream: ReadableStream) {
    this.sseStream = sseStream;
  }
}
