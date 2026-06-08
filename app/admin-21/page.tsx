import type { Metadata } from 'next';
import { members } from '../data';
import { AdminEditor } from './admin-editor';

export const metadata: Metadata = {
  title: '成员编辑',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return <AdminEditor initialMembers={members} />;
}
