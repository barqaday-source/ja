-- دعم الملفات والمستندات في محادثات Jabilak
-- شغّل هذا الملف بعد إنشاء جدول public.messages وقبل إرسال ملفات من التطبيق.
alter table public.messages drop constraint if exists messages_kind_check;
alter table public.messages add constraint messages_kind_check check (kind in ('text', 'image', 'file', 'voice'));

alter table public.messages add column if not exists file_name text;
alter table public.messages add column if not exists mime_type text;
alter table public.messages add column if not exists file_size_bytes bigint;

alter table public.messages add constraint messages_file_size_check
  check (file_size_bytes is null or (file_size_bytes > 0 and file_size_bytes <= 26214400));
alter table public.messages add constraint messages_file_metadata_check
  check (
    kind <> 'file'
    or (file_name is not null and mime_type is not null and file_size_bytes is not null and attachment_path is not null)
  );

create index if not exists messages_file_kind_idx on public.messages(conversation_id, kind) where kind = 'file';

-- لا نسمح للمستخدم بتغيير المرسل أو المحادثة عند تعديل رسالة.
-- سياسة messages_sender_update الموجودة مسبقاً تغطي ذلك على مستوى RLS.
