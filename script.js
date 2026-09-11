import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";
const git = simpleGit();

const TOTAL_COMMITS = 100;
const DAYS = 365;

// Generate a date within the last year
function getDate(daysAgo) {
  return moment()
    .subtract(daysAgo, "days")
    .hour(random.int(9, 18))
    .minute(random.int(0, 59))
    .second(random.int(0, 59))
    .format();
}

async function commitAt(date, number) {
  await jsonfile.writeFile(path, {
    date,
    commit: number
  });

  await git
    .add(path)
    .commit(`Test contribution ${number}`, {
      "--date": date
    });
}

async function makeCommits() {
  let count = 0;

  // Create activity across roughly 60% of the days
  const activeDays = new Set();

  while (activeDays.size < 220) {
    activeDays.add(random.int(0, DAYS - 1));
  }

  const days = [...activeDays];

  while (count < TOTAL_COMMITS) {
    const daysAgo = days[random.int(0, days.length - 1)];

    /*
      Distribution:
      1 commit  -> mostly light green
      2 commits -> medium
      3 commits -> darker
      4-6       -> occasional dark
    */
    const roll = random.int(1, 100);

    let commitsToday;

    if (roll <= 60) {
      commitsToday = 1;
    } else if (roll <= 85) {
      commitsToday = 2;
    } else if (roll <= 96) {
      commitsToday = 3;
    } else {
      commitsToday = random.int(4, 6);
    }

    // Don't exceed 500
    commitsToday = Math.min(commitsToday, TOTAL_COMMITS - count);

    for (let i = 0; i < commitsToday; i++) {
      const date = getDate(daysAgo);

      count++;

      console.log(
        `Commit ${count}/${TOTAL_COMMITS} - ${date}`
      );

      await commitAt(date, count);

      if (count >= TOTAL_COMMITS) break;
    }
  }

  console.log("\nFinished creating 500 commits.");
  console.log("Pushing to GitHub...");

  await git.push();

  console.log("Done.");
}

makeCommits().catch(console.error);
