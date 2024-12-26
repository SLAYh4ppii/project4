import { useState } from 'react';

interface SignupFormData {
  username: string;
  password: string;
}

export default function Signup() {
  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    password: ''
  });

  return null; // TODO: Implement signup form
}