<script>
	const rows = Array.from({ length: 24 }, (_, index) => ({
		id: index + 1,
		title: 'Row ' + (index + 1),
		active: index % 3 === 0
	}));
	let selected = $state(0);
	let picked = $derived(rows[selected] ?? null);
</script>

<view class="panel">
	<text class="panel-title">Scroll view</text>
	<text class="summary">{picked == null ? 'Pick a row' : 'Selected: ' + picked.title}</text>

	<scroll-view class="scroller" scroll-orientation="vertical">
		{#each rows as row (row.id)}
			<view
				class="row {selected === row.id - 1 ? 'row-selected' : ''}"
				onbindtap={() => (selected = row.id - 1)}
			>
				<text class="row-text">{row.title}</text>
				{#if row.active}
					<text class="row-badge">active</text>
				{/if}
			</view>
		{/each}
	</scroll-view>
</view>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}
	.panel-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #222222;
	}
	.summary {
		font-size: 26rpx;
		color: #777777;
	}
	.scroller {
		height: 560rpx;
		border-radius: 24rpx;
		background-color: #ffffff;
		border: 1rpx solid #eeeeee;
	}
	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 22rpx 26rpx;
		border-bottom: 1rpx solid #f4f4f4;
	}
	.row-selected {
		background-color: #fff1ea;
	}
	.row-text {
		font-size: 30rpx;
		color: #333333;
	}
	.row-badge {
		font-size: 22rpx;
		color: #ff3e00;
	}
</style>
