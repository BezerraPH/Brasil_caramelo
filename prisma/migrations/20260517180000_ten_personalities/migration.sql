-- Expande personalidades caninas (10 raças) e migra SALSICHA -> PINSCHER

ALTER TYPE "DogReputationLevel" RENAME TO "DogReputationLevel_old";

CREATE TYPE "DogReputationLevel" AS ENUM (
  'PITBULL',
  'HUSKY',
  'CARAMELO',
  'POODLE',
  'PINSCHER',
  'GOLDEN',
  'VIRALATA',
  'BORDER_COLLIE',
  'BASSET_HOUND',
  'CHOW_CHOW'
);

ALTER TABLE "Reputation"
  ALTER COLUMN "level" TYPE "DogReputationLevel"
  USING (
    CASE "level"::text
      WHEN 'SALSICHA' THEN 'PINSCHER'
      ELSE "level"::text
    END
  )::"DogReputationLevel";

DROP TYPE "DogReputationLevel_old";
