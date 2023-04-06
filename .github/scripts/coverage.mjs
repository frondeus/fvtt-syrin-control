export default async function coverMe({ github, context }) {
	const diffCoverage = process.env.DIFF_COVERAGE;
	const [_, coverageInfo, summary] = diffCoverage
		.split('-------------')
		.map((s) => s.trim())
		.filter((s) => s.length !== 0);

	// Include a smaller message if there is no coverage information for the diff

	const smallInfo = `\`\`\`\n${coverageInfo}\n\`\`\``;

	const reportBody = !summary
		? smallInfo
		: `\`\`\`
  ${summary}
  \`\`\`

  <details>
    <summary>Detailed Coverage Report</summary>

    \`\`\`
    ${coverageInfo}
    \`\`\`
  </details>`;

	const templatedMessage = `##  Coverage Report:\n\n${reportBody}`;
	const { data: existingComments } = await github.rest.issues.listComments({
		owner: context.repo.owner,
		repo: context.repo.repo,
		issue_number: context.issue.number
	});

	const githubActionComments = existingComments.filter(
		(comment) =>
			comment.user.login === 'github-actions[bot]' && comment.body.includes('Coverage Report')
	);
	if (githubActionComments.length) {
		const latestComment = githubActionComments.reverse()[0];

		if (latestComment.body === templatedMessage) {
			core.info('Diff comment with the same message already exists - not posting.');
			return;
		}
	}

	github.rest.issues.createComment({
		owner: context.repo.owner,
		repo: context.repo.repo,
		issue_number: context.issue.number,
		body: templatedMessage
	});
}
