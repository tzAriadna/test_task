class Person {
  constructor(lastName, firstName, patronymic, dateOfBirth, phoneNumber, password, employment = null, identityDocument = null, authorizationKey = null) {
      this.lastName = lastName;
      this.firstName = firstName;
      this.patronymic = patronymic;
      this.dateOfBirth = dateOfBirth;
      this.phoneNumber = phoneNumber;
      this.password = password;
      this.employment = employment;
      this.identityDocument = identityDocument;
      this.authorizationKey = authorizationKey;
  }
}

module.exports = Person;
