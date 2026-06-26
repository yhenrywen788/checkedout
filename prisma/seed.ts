import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sealAuthor } from "../src/lib/anon-escrow";

const prisma = new PrismaClient();

const HOUR = 3_600_000;
const now = Date.now();
const ago = (hours: number) => new Date(now - hours * HOUR);

async function main() {
  console.log("Resetting data…");
  // Delete in dependency order.
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.credit.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.review.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.accomplishment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.persona.deleteMany();
  await prisma.session.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.space.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("checkedout", 10);

  console.log("Creating users…");
  const maya = await prisma.user.create({
    data: {
      email: "maya@example.com",
      handle: "maya",
      name: "Maya Okafor",
      passwordHash,
      avatarColor: "#e8590c",
      headline: "Staff engineer. Reformed perfectionist.",
      affiliation: "Payments infra @ a fintech",
      bio: "I make slow systems fast and keep on-call humane. Twelve years in, still googling basic SQL.",
      goodAt:
        "Performance debugging, mentoring juniors without making them feel small, writing the doc nobody wants to write.",
      workingOn:
        "Saying no earlier. I take on too much and then resent it. Working on it, out loud, here.",
      lookingFor:
        "People who've scaled reconciliation systems. And honestly, peers who'll tell me when I'm wrong.",
    },
  });

  const dario = await prisma.user.create({
    data: {
      email: "dario@example.com",
      handle: "dario",
      name: "Dario Fenn",
      passwordHash,
      avatarColor: "#2f6f4f",
      headline: "Founder. Two failures, one that stuck.",
      affiliation: "Building something small and useful",
      bio: "Sold a company for parts, started another. The second one only works because the first one hurt.",
      goodAt: "Going from zero to one. Hiring people smarter than me.",
      workingOn: "Delegating. I still touch things I shouldn't.",
      lookingFor: "Honest operators who've been past 20 employees.",
    },
  });

  const lin = await prisma.user.create({
    data: {
      email: "lin@example.com",
      handle: "lin",
      name: "Lin Zhao",
      passwordHash,
      avatarColor: "#1f6feb",
      headline: "Research scientist. Pro-replication, anti-hype.",
      affiliation: "Interpretability, independent",
      bio: "Left a big lab to do work I can fully stand behind. Posting preprints here for real review first.",
      goodAt: "Mechanistic interpretability, careful ablations, killing my own darlings.",
      workingOn: "Writing for people outside my subfield.",
      lookingFor: "Reviewers who will actually try to break my claims.",
    },
  });

  const sam = await prisma.user.create({
    data: {
      email: "sam@example.com",
      handle: "sam",
      name: "Sam Reyes",
      passwordHash,
      avatarColor: "#9333ea",
      headline: "Design + PM. Allergic to roadmap theater.",
      bio: "I ship small things that work over big things that demo well.",
      goodAt: "Turning vague complaints into shippable scope.",
      workingOn: "Patience with process.",
      lookingFor: "Engineers who like to design with me, not after me.",
    },
  });

  const priya = await prisma.user.create({
    data: {
      email: "priya@example.com",
      handle: "priya",
      name: "Priya Nair",
      passwordHash,
      avatarColor: "#0e7490",
      headline: "ML engineer. Skeptic by training.",
      affiliation: "Recommenders @ a marketplace",
      bio: "I've shipped models that helped and models that quietly didn't. Learned more from the second kind.",
      goodAt: "Offline/online gaps, eval design, saying 'that's just a baseline.'",
      workingOn: "Not derailing meetings with caveats.",
      lookingFor: "People doing honest eval work.",
    },
  });

  // A persistent pseudonym for Maya — same person, different mask.
  const saltMarsh = await prisma.persona.create({
    data: {
      userId: maya.id,
      handle: "saltmarsh",
      displayName: "Salt Marsh",
      bio: "Opinions my employer would prefer I keep to myself.",
    },
  });

  console.log("Creating spaces…");
  const grind = await prisma.space.create({
    data: {
      slug: "the-grind",
      name: "The Grind",
      tagline: "Real talk about what doing the work actually takes.",
      description:
        "No 'thrilled to announce.' Post the accomplishment and the mess behind it, or just say the true thing.",
      kind: "GENERAL",
      accent: "#e8590c",
      createdAt: ago(720),
    },
  });

  const openReview = await prisma.space.create({
    data: {
      slug: "open-review",
      name: "Open Review",
      tagline: "Crowd-reviewed science. Route around the journals.",
      description:
        "Put a paper up and let the people who know the work review it in the open. Reviews can be signed or anonymous — the critique matters more than the name attached.",
      kind: "PAPER_REVIEW",
      allowAnon: true,
      defaultIdentity: "PSEUDONYM",
      accent: "#1f6feb",
      createdAt: ago(700),
    },
  });

  const help = await prisma.space.create({
    data: {
      slug: "cross-company-help",
      name: "Cross-Company Help",
      tagline: "Engineers helping engineers — across company lines.",
      description:
        "The hard problems don't respect org charts. Ask for real-time help, anonymously when it needs to be. What's said here stays here.",
      kind: "HELP_DESK",
      allowAnon: true,
      accent: "#0e7490",
      createdAt: ago(680),
    },
  });

  const fringe = await prisma.space.create({
    data: {
      slug: "tin-foil",
      name: "Tin Foil",
      tagline: "Fringe, half-baked, and tin-hat theories — argued in good faith.",
      description:
        "The eclectic corner. Wild ideas welcome; bad-faith and cruelty aren't.",
      kind: "GENERAL",
      allowAnon: true,
      accent: "#a16207",
      createdAt: ago(650),
    },
  });

  console.log("Creating memberships & follows…");
  const everyone = [maya, dario, lin, sam, priya];
  for (const u of everyone) {
    await prisma.membership.create({
      data: { userId: u.id, spaceId: grind.id },
    });
  }
  for (const u of [lin, priya, maya]) {
    await prisma.membership.create({
      data: { userId: u.id, spaceId: openReview.id },
    });
  }
  for (const u of [maya, priya, sam]) {
    await prisma.membership.create({
      data: { userId: u.id, spaceId: help.id },
    });
  }
  await prisma.membership.create({
    data: { userId: maya.id, spaceId: fringe.id, role: "OWNER" },
  });

  const follows: [string, string][] = [
    [sam.id, maya.id],
    [priya.id, maya.id],
    [maya.id, lin.id],
    [dario.id, maya.id],
    [priya.id, lin.id],
  ];
  for (const [followerId, followingId] of follows) {
    await prisma.follow.create({ data: { followerId, followingId } });
  }

  console.log("Creating posts…");

  // 1) Accomplishment — the structured real story, with specific credit.
  const accomplishment = await prisma.post.create({
    data: {
      type: "ACCOMPLISHMENT",
      identityMode: "REAL",
      authorId: maya.id,
      spaceId: grind.id,
      title: "Cut checkout p99 latency from 4.1s to 380ms",
      body: "Sharing this because the clean version would be a lie.",
      createdAt: ago(5),
      accomplishment: {
        create: {
          outcome:
            "Checkout p99 went from 4.1s to 380ms over six weeks. Conversion on mobile up 9%. No new infrastructure spend.",
          theMessyMiddle:
            "I was sure it was the database for three weeks. It wasn't. I rewrote a perfectly good query, added two indexes we didn't need, and made staging slower in the process. The actual cause was a synchronous call to a fraud service we could batch. I'd looked at that trace a dozen times and my brain filtered it out because 'that's always been there.' Two days of being wrong in public in our channel finally got someone to point at it.",
          whatItTook:
            "About 60 hours, half of them down the wrong hole. A very patient SRE who let me be wrong. Skipping a conference I'd paid for. One genuinely bad week of sleep.",
          whatIdDoDifferently:
            "Bring in a second set of eyes on day two, not day fifteen. Ego cost us a month.",
        },
      },
      credits: {
        create: [
          {
            creditedUserId: priya.id,
            creditedName: "Priya Nair",
            contribution:
              "Spotted the batchable fraud call in the trace I'd been staring past for two weeks.",
          },
          {
            creditedName: "Tomas (our SRE, not on here)",
            contribution:
              "Held the line on staging and let me fail without making it a thing.",
          },
        ],
      },
      tags: {
        create: [
          {
            tag: {
              connectOrCreate: {
                where: { slug: "performance" },
                create: { slug: "performance", name: "performance", kind: "SKILL" },
              },
            },
          },
          {
            tag: {
              connectOrCreate: {
                where: { slug: "distributed-systems" },
                create: {
                  slug: "distributed-systems",
                  name: "distributed-systems",
                },
              },
            },
          },
        ],
      },
    },
  });

  // 2) Contrarian real-talk.
  const realTalk = await prisma.post.create({
    data: {
      type: "REAL_TALK",
      identityMode: "REAL",
      authorId: dario.id,
      spaceId: grind.id,
      body: "We deleted every 'productivity' dashboard last quarter — story points, velocity, lines changed, all of it. Shipped more in the next eight weeks than the previous sixteen. Turns out measuring activity was teaching everyone to perform activity. We track exactly two things now: did a real user's problem go away, and is anyone quietly drowning. That's it.",
      createdAt: ago(20),
      tags: {
        create: [
          {
            tag: {
              connectOrCreate: {
                where: { slug: "management" },
                create: { slug: "management", name: "management" },
              },
            },
          },
        ],
      },
    },
  });

  // 3) Anonymous confession — the kind of honesty anonymity unlocks.
  const anonPost = await prisma.post.create({
    data: {
      type: "REAL_TALK",
      identityMode: "ANON",
      authorId: null,
      sealedAuthor: sealAuthor(sam.id),
      spaceId: grind.id,
      body: "I got promoted to lead eight months ago and I think I was better at the job before. I miss building. I'm slower at the thing I'm now paid more to do, and I can't say that to my manager or my reports. Posting it here because I needed to say it somewhere true.",
      createdAt: ago(31),
    },
  });

  // 4) Help request — anonymous, across company lines.
  const helpPost = await prisma.post.create({
    data: {
      type: "HELP_REQUEST",
      identityMode: "ANON",
      authorId: null,
      sealedAuthor: sealAuthor(priya.id),
      spaceId: help.id,
      title: "Payments reconciliation drifts by a few cents at high volume",
      body: "At ~2k tx/sec our ledger and the processor's totals diverge by single-digit cents per batch. Reproduces only above ~1.5k/sec, never locally. We round half-to-even everywhere we know of. Suspecting a currency-conversion path that rounds before aggregating, but I can't prove it. Anyone seen this failure shape? Happy to go deep in replies.",
      createdAt: ago(8),
      helpRequest: { create: { status: "CLAIMED", isUrgent: true, claimedById: maya.id } },
      tags: {
        create: [
          {
            tag: {
              connectOrCreate: {
                where: { slug: "payments" },
                create: { slug: "payments", name: "payments" },
              },
            },
          },
        ],
      },
    },
  });

  // 5) Paper under open review.
  const paperPost = await prisma.post.create({
    data: {
      type: "PAPER",
      identityMode: "REAL",
      authorId: lin.id,
      spaceId: openReview.id,
      title:
        "Sparse Autoencoders Recover Stable Interpretable Features Across Training Seeds",
      body: "Preprint up for open review before I submit anywhere. I want the holes found here first. Please try to break it.",
      createdAt: ago(48),
      paper: {
        create: {
          authorsText: "L. Zhao, R. Mbeki",
          abstract:
            "We train sparse autoencoders (SAEs) on the residual stream of a 1.4B-parameter language model across ten random seeds and measure feature stability. We find that ~63% of high-activation features recur across seeds with cosine similarity > 0.8, suggesting the decomposition recovers properties of the model rather than the SAE's initialization. We release code, all ten checkpoints, and a feature-matching protocol. We discuss where the method fails: low-frequency features remain seed-dependent and we do not claim causal sufficiency.",
          pdfUrl: "https://example.org/preprints/sae-stability.pdf",
          doi: null,
          status: "UNDER_REVIEW",
          reviews: {
            create: [
              {
                reviewerId: priya.id,
                identityMode: "REAL",
                recommendation: "MINOR_REVISION",
                summary:
                  "Careful, honest work. The stability result is believable and the released checkpoints make it checkable. My one real concern is the 0.8 cosine threshold — the headline number moves a lot if you sweep it, and that sweep belongs in the main text, not the appendix.",
                strengths:
                  "Ten seeds (not three). Negative results stated plainly. Reproducible artifact.",
                weaknesses:
                  "Threshold sensitivity under-discussed. 'Interpretable' is asserted via examples, not a metric.",
                scoreRigor: 4,
                scoreNovelty: 3,
                scoreClarity: 4,
                createdAt: ago(30),
              },
              {
                reviewerId: null,
                sealedAuthor: sealAuthor(maya.id),
                identityMode: "ANON",
                recommendation: "MAJOR_REVISION",
                summary:
                  "I buy the recurrence but not yet the implied 'recovers properties of the model.' Recurrence across seeds is consistent with shared dataset statistics rather than model structure. A control — SAEs trained on shuffled activations — would separate those, and without it the strongest claim is unsupported.",
                strengths: "Strong artifact. The failure cases are stated, which I respect.",
                weaknesses:
                  "Missing the shuffled-activation control. Causal language outruns the evidence.",
                scoreRigor: 3,
                scoreNovelty: 3,
                scoreClarity: 4,
                createdAt: ago(26),
              },
            ],
          },
        },
      },
      tags: {
        create: [
          {
            tag: {
              connectOrCreate: {
                where: { slug: "interpretability" },
                create: { slug: "interpretability", name: "interpretability" },
              },
            },
          },
        ],
      },
    },
  });

  // 6) Pseudonymous fringe take — same person as Maya, different mask.
  const fringePost = await prisma.post.create({
    data: {
      type: "DISCUSSION",
      identityMode: "PSEUDONYM",
      authorId: null,
      sealedAuthor: sealAuthor(maya.id),
      personaId: saltMarsh.id,
      spaceId: fringe.id,
      title: "Half-baked: most 'tech debt' is unmade product decisions",
      body: "Hear me out. The majority of what we call tech debt isn't engineers being sloppy — it's product refusing to decide, so the code holds three possible futures at once. The 'debt' is just deferred decisions wearing an engineering costume. Change my mind.",
      createdAt: ago(12),
    },
  });

  // 7) Eclectic / lighter real-talk, to show range.
  const lightPost = await prisma.post.create({
    data: {
      type: "REAL_TALK",
      identityMode: "REAL",
      authorId: sam.id,
      spaceId: grind.id,
      body: "Boring win of the week: I wrote a 9-line script that renames our screenshots so QA stops losing them. Saved maybe four minutes a day for six people. No demo, no slide. Still the most appreciated thing I shipped this month.",
      createdAt: ago(14),
    },
  });

  console.log("Adding reactions & comments…");
  const react = (postId: string, userId: string, type: any) =>
    prisma.reaction.create({ data: { postId, userId, type } });

  await Promise.all([
    react(accomplishment.id, dario.id, "RESPECT"),
    react(accomplishment.id, sam.id, "THIS_IS_REAL"),
    react(accomplishment.id, priya.id, "BEEN_THERE"),
    react(accomplishment.id, lin.id, "RESPECT"),
    react(realTalk.id, maya.id, "CHANGED_MY_MIND"),
    react(realTalk.id, sam.id, "THIS_IS_REAL"),
    react(anonPost.id, maya.id, "BEEN_THERE"),
    react(anonPost.id, dario.id, "RESPECT"),
    react(anonPost.id, lin.id, "BEEN_THERE"),
    react(paperPost.id, priya.id, "RESPECT"),
    react(fringePost.id, dario.id, "TELL_ME_MORE"),
    react(lightPost.id, maya.id, "THIS_IS_REAL"),
    react(lightPost.id, priya.id, "RESPECT"),
  ]);

  const comment = (
    postId: string,
    authorId: string,
    body: string,
    hours: number,
    identityMode: any = "REAL",
  ) =>
    prisma.comment.create({
      data: {
        postId,
        body,
        identityMode,
        createdAt: ago(hours),
        // REAL links to the account; non-REAL seals the author (mock escrow).
        authorId: identityMode === "REAL" ? authorId : null,
        sealedAuthor: identityMode === "REAL" ? null : sealAuthor(authorId),
      },
    });

  await Promise.all([
    comment(
      accomplishment.id,
      priya.id,
      "For the record, you'd have found it a day later anyway. But yes — second set of eyes on day two, always.",
      4,
    ),
    comment(
      anonPost.id,
      maya.id,
      "This is the most honest thing I've read here. The job changed; you didn't get worse. Took me two years to believe that about myself.",
      30,
    ),
    comment(
      helpPost.id,
      maya.id,
      "Seen exactly this. Check whether your FX conversion rounds per-line before you sum. We summed minor units as integers and only converted at the boundary — drift went to zero. Happy to screen-share.",
      7,
    ),
    comment(
      helpPost.id,
      sam.id,
      "Not my area but following — we're about to hit similar volume.",
      6,
      "ANON",
    ),
    comment(
      paperPost.id,
      lin.id,
      "The shuffled-activation control is fair and I don't have it. Running it now; will post results here even if they hurt.",
      24,
    ),
  ]);

  console.log("\nSeed complete.");
  console.log("Demo login — any of these, password: checkedout");
  for (const u of everyone) console.log(`  ${u.email}  (@${u.handle})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
