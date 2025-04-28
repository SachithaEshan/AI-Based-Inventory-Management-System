export default class CustomError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errorType: string
  ) {
    super(message);
    this.name = 'CustomError';
  }
}
