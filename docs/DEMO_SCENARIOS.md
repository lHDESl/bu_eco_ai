# Demo Scenarios

## Scenario 1: Household Medicine

- User asks: `집에 남은 감기약은 어디에 버리나요?`
- Expected behavior:
  - answer in Korean
  - direct the user to pharmacy or health-related collection point guidance
  - cite `cheonan-waste-disposal-page`
- Notes: strong candidate for a reliable text-only demo

## Scenario 2: Large Waste

- User asks: `의자는 대형폐기물인가요? 어떻게 신청하나요?`
- Expected behavior:
  - explain large-waste disposal flow in simple Korean
  - mention official request routes rather than vague advice
  - cite `cheonan-waste-disposal-page`
- Notes: good for showing actionability and official route guidance

## Scenario 3: General Combustible Household Waste

- User asks: `일반 생활쓰레기는 어떻게 버리나요?`
- Expected behavior:
  - instruct the user to use a volume-rate trash bag
  - cite `cheonan-waste-disposal-page`
- Notes: simplest baseline scenario for smoke testing

## Stretch Scenario 4: Ambiguous Image Question

- User asks with image: `이거 재활용 되나요?`
- Expected behavior:
  - infer a likely item category only if evidence is sufficient
  - retrieve official source support before giving disposal guidance
  - ask a follow-up question if material or contamination is unclear
- Notes: best used after the environment ministry PDF is fully extracted and tested
