import {redirect} from 'next/navigation';

// Old bookmarks bypass the retired signup form. Early Read starts Google OAuth.
export default function JoinPage() {
  redirect('/early-read');
}
