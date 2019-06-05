// const petsTables = [
//   {
//     'name': 'pet',
//     'modelName': 'Pet',
//     'title': 'Pet',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       },
//       {
//         'name': 'name',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 255,
//         'description': 'Pet name'
//       },
//       {
//         'name': 'description',
//         'type': 'string',
//         'nullable': true,
//         'minLength': 1,
//         'maxLength': 1000,
//         'description': 'Pet description'
//       },
//       {
//         'name': 'dob',
//         'type': 'date',
//         'default': '2000-01-01',
//         'maxLength': 1000,
//         'description': 'Pet date of birth'
//       },
//       {
//         'name': 'ownerId',
//         'type': 'id',
//         'description': 'Owner'
//       },
//       {
//         'name': 'owner',
//         'kind': 'BelongsToOne',
//         'type': 'relation',
//         'from': 'ownerId',
//         'table': 'person',
//         'to': 'id',
//         'onDelete': 'CASCADE'
//       }
//     ],
//     'indexes': [
//       {
//         'columns': [
//           'name'
//         ]
//       }
//     ]
//   },
//   {
//     'name': 'person',
//     'modelName': 'Person',
//     'title': 'Person',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       },
//       {
//         'name': 'title',
//         'type': 'string',
//         'enum': [
//           'Mr',
//           'Mrs',
//           'Miss',
//           'Ms'
//         ],
//         'default': 'Mr',
//         'title': 'Name',
//         'description': 'Person title'
//       },
//       {
//         'name': 'firstName',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 255,
//         'title': 'First name',
//         'description': 'Person first name'
//       },
//       {
//         'name': 'lastName',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 255,
//         'description': 'Person last name'
//       },
//       {
//         'name': 'age',
//         'type': 'integer',
//         'title': 'Age',
//         'description': 'Person age'
//       },
//       {
//         'name': 'dob',
//         'type': 'number',
//         'description': 'Simple price'
//       },
//       {
//         'name': 'ni',
//         'type': 'string',
//         'minLength': 8,
//         'maxLength': 11,
//         'description': 'National Insurance Number'
//       },
//       {
//         'name': 'address',
//         'type': 'string'
//       },
//       {
//         'name': 'latLong',
//         'type': 'boolean'
//       },
//       {
//         'name': 'pets',
//         'type': 'relation',
//         'kind': 'HasMany',
//         'from': 'id',
//         'table': 'pet',
//         'to': 'ownerId'
//       }
//     ],
//     'indexes': [
//       {
//         'columns': [
//           'firstName',
//           'lastName'
//         ]
//       },
//       {
//         'columns': [
//           'ni'
//         ],
//         'unique': true
//       }
//     ]
//   }
// ]

// const simpleTables = [
//   {
//     'name': 'simple',
//     'modelName': 'Simple',
//     'title': 'Simple',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       },
//       {
//         'name': 'name',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 255,
//         'description': 'Simple name'
//       },
//       {
//         'name': 'description',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 1000,
//         'description': 'Simple description'
//       },
//       {
//         'name': 'content',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 1000,
//         'description': 'Simple content'
//       },
//       {
//         'name': 'age',
//         'type': 'integer',
//         'description': 'Simple age',
//         'minimum': 0,
//         'maximum': 150
//       },
//       {
//         'name': 'flag',
//         'type': 'boolean',
//         'title': 'Done?',
//         'description': 'Simple flag'
//       },
//       {
//         'name': 'price',
//         'type': 'number',
//         'description': 'Simple price'
//       },
//       {
//         'name': 'purchasedAt',
//         'type': 'datetime',
//         'description': 'Simple datetime'
//       },
//       {
//         'name': 'email',
//         'type': 'string',
//         'format': 'email',
//         'description': 'Simple email'
//       },
//       {
//         'name': 'agreeTerms',
//         'type': 'boolean',
//         'title': 'T&C',
//         'description': 'I agree to the Terms and Conditions',
//         'enumNames': [
//           'Yes',
//           'No'
//         ]
//       }
//     ]
//   }
// ]

// const courseTables = [
//   {
//     'name': 'student',
//     'modelName': 'Student',
//     'title': 'Student',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       },
//       {
//         'name': 'name',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 255,
//         'description': 'Student name'
//       },
//       {
//         'name': 'description',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 1000,
//         'description': 'Student description'
//       },
//       {
//         'name': 'age',
//         'type': 'integer',
//         'description': 'Student age'
//       },
//       {
//         'name': 'typeId',
//         'type': 'id'
//       },
//       {
//         'name': 'type',
//         'type': 'relation',
//         'kind': 'BelongsToOne',
//         'from': 'typeId',
//         'table': 'studentType',
//         'to': 'id'
//       },
//       {
//         'name': 'enrollments',
//         'type': 'relation',
//         'kind': 'HasMany',
//         'from': 'id',
//         'table': 'enrollment',
//         'to': 'studentId'
//       }
//     ]
//   },
//   {
//     'name': 'course',
//     'modelName': 'Course',
//     'title': 'Course',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       },
//       {
//         'name': 'name',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 255,
//         'description': 'Course name'
//       },
//       {
//         'name': 'description',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 1000,
//         'description': 'Course description'
//       },
//       {
//         'name': 'content',
//         'type': 'string',
//         'description': 'Course content'
//       },
//       {
//         'name': 'enrollments',
//         'type': 'relation',
//         'kind': 'HasMany',
//         'from': 'id',
//         'table': 'enrollment',
//         'to': 'courseId'
//       }
//     ]
//   },
//   {
//     'name': 'enrollment',
//     'modelName': 'Enrollment',
//     'title': 'Enrollment',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       },
//       {
//         'name': 'start',
//         'type': 'date',
//         'description': 'Enrollment start'
//       },
//       {
//         'name': 'end',
//         'type': 'date',
//         'description': 'Enrollment end'
//       },
//       {
//         'name': 'studentId',
//         'type': 'id'
//       },
//       {
//         'name': 'courseId',
//         'type': 'id'
//       },
//       {
//         'name': 'student',
//         'type': 'relation',
//         'kind': 'BelongsToOne',
//         'from': 'studentId',
//         'table': 'student',
//         'to': 'id'
//       },
//       {
//         'name': 'course',
//         'type': 'relation',
//         'kind': 'BelongsToOne',
//         'from': 'courseId',
//         'table': 'course',
//         'to': 'id'
//       }
//     ]
//   },
//   {
//     'name': 'studentType',
//     'modelName': 'StudentType',
//     'title': 'Student type',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       },
//       {
//         'name': 'name',
//         'type': 'string',
//         'enum': [
//           'grad',
//           'postgrad'
//         ],
//         'description': 'Student Type'
//       }
//     ]
//   }
// ]

// const ecommerceTables = [
//   {
//     'name': 'customer',
//     'modelName': 'Customer',
//     'title': 'Customer',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       },
//       {
//         'name': 'title',
//         'type': 'string',
//         'enum': [
//           'Mr',
//           'Mrs',
//           'Miss',
//           'Ms'
//         ],
//         'default': 'Mr',
//         'title': 'Name',
//         'description': 'Person title'
//       },
//       {
//         'name': 'firstName',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 255,
//         'title': 'First name',
//         'description': 'Person first name'
//       },
//       {
//         'name': 'lastName',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 255,
//         'description': 'Person last name'
//       },
//       {
//         'name': 'ni',
//         'type': 'string',
//         'minLength': 8,
//         'maxLength': 11,
//         'description': 'National Insurance Number'
//       },
//       {
//         'name': 'address',
//         'type': 'json',
//         'ref': './address.json'
//       },
//       {
//         'name': 'basket',
//         'type': 'relation',
//         'kind': 'HasOne',
//         'from': 'id',
//         'table': 'basket',
//         'to': 'customerId'
//       }
//     ]
//   },
//   {
//     'name': 'product',
//     'modelName': 'Product',
//     'title': 'Product',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       }, {
//         'name': 'code',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 255,
//         'description': 'Product code'
//       }, {
//         'name': 'name',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 255,
//         'description': 'Product name'
//       }, {
//         'name': 'description',
//         'type': 'string',
//         'minLength': 1,
//         'maxLength': 1000,
//         'description': 'Product description'
//       },
//       {
//         'name': 'price',
//         'type': 'number',
//         'minimum': 0.1
//       }
//     ]
//   },
//   {
//     'name': 'basket',
//     'modelName': 'Basket',
//     'title': 'Basket',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       }, {
//         'name': 'customerId',
//         'type': 'id'
//       },
//       {
//         'name': 'customer',
//         'type': 'relation',
//         'kind': 'BelongsToOne',
//         'from': 'customerId',
//         'table': 'customer',
//         'to': 'id'
//       },
//       {
//         'name': 'lines',
//         'type': 'relation',
//         'kind': 'HasMany',
//         'from': 'id',
//         'table': 'basketLine',
//         'to': 'basketId'
//       }
//     ]
//   },
//   {
//     'name': 'basketLine',
//     'modelName': 'BasketLine',
//     'title': 'Basket line',
//     'fields': [
//       {
//         'name': 'id',
//         'type': 'id'
//       }, {
//         'name': 'basketId',
//         'type': 'id'
//       }, {
//         'name': 'productId',
//         'type': 'id'
//       }, {
//         'name': 'quantity',
//         'type': 'integer'
//       },
//       {
//         'name': 'basket',
//         'type': 'relation',
//         'kind': 'BelongsToOne',
//         'from': 'basketId',
//         'table': 'basket',
//         'to': 'id'
//       },
//       {
//         'name': 'product',
//         'type': 'relation',
//         'kind': 'BelongsToOne',
//         'from': 'productId',
//         'table': 'product',
//         'to': 'id'
//       }
//     ]
//   }
// ]

// const app = {
//   'name': 'Demo',
//   'tables': [].concat(
//     petsTables,
//     simpleTables,
//     ecommerceTables,
//     courseTables
//   )
// }

// export default app
