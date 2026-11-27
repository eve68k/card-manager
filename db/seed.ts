import { defineSeed } from "void/seed";

export default defineSeed<typeof import("./schema")>(async ({ db, schema }) => {
  const [conf, meetup] = await db
    .insert(schema.events)
    .values([
      { name: "TechConf 2026", date: "2026-10-12", place: "東京" },
      { name: "Rust Meetup #42", date: "2026-11-08", place: "渋谷" },
    ])
    .returning({ id: schema.events.id });

  const [alice, bob] = await db
    .insert(schema.contacts)
    .values([
      {
        name: "山田 花子",
        affiliation: "Example株式会社 SRE",
        memo: "Kubernetes の運用自動化の話で盛り上がった。赤いパーカー。",
      },
      {
        name: "佐藤 太郎",
        affiliation: "フリーランス",
        memo: "LT で WebAssembly の発表をしていた。",
      },
    ])
    .returning({ id: schema.contacts.id });

  const [sre, rust] = await db
    .insert(schema.tags)
    .values([{ name: "SRE" }, { name: "Rust" }])
    .returning({ id: schema.tags.id });

  if (!conf || !meetup || !alice || !bob || !sre || !rust) throw new Error("Seed insert failed");

  await db.insert(schema.contactEvents).values([
    { contactId: alice.id, eventId: conf.id },
    { contactId: bob.id, eventId: conf.id },
    { contactId: bob.id, eventId: meetup.id },
  ]);
  await db.insert(schema.contactTags).values([
    { contactId: alice.id, tagId: sre.id },
    { contactId: bob.id, tagId: rust.id },
  ]);
  await db.insert(schema.socialLinks).values([
    { contactId: alice.id, service: "x", handle: "hanako_example" },
    { contactId: bob.id, service: "github", handle: "taro-example" },
  ]);
});
