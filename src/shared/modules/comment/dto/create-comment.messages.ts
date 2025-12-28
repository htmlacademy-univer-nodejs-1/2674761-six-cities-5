export const CreateCommentValidationMessage = {
  text: {
    minLength: 'Minimum text length must be 5',
    maxLength: 'Maximum text length must be 1024',
    invalidFormat: 'Field text must be an string'
  },
  createdDate: {
    invalidFormat: 'createdDate must be a valid ISO date',
  },
  rating: {
    invalidFormat: 'Rating must be an integer',
    minValue: 'Minimum rating is 1',
    maxValue: 'Maximum rating is 5',
  },
  authorId: {
    invalidId: 'authorId field must be a valid id',
  },
  rentOfferId: {
    invalidId: 'rentOfferId field must be a valid id',
  }
} as const;
