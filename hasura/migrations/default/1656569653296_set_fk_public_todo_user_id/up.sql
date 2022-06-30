alter table "public"."todo"
  add constraint "todo_user_id_fkey"
  foreign key ("user_id")
  references "public"."user"
  ("id") on update restrict on delete restrict;
