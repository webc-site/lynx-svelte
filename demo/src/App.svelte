<script>
	import TodoList from './component/TodoList.svelte';
	import StyleDemo from './component/StyleDemo.svelte';
	import ListDemo from './component/ListDemo.svelte';

	let section = $state('todo');
	const sections = [
		{ id: 'todo', label: 'Todo' },
		{ id: 'style', label: 'Style' },
		{ id: 'list', label: 'List' }
	];
</script>

<scroll-view class="page">
	<view class="header">
		<image class="logo" src="https://github.com/sveltejs/branding/raw/master/svelte-logo-square.png" />
		<text class="title">Svelte + Lynx</text>
		<text class="subtitle">PR #18042 custom renderer</text>
	</view>

	<view class="tabs">
		{#each sections as item (item.id)}
			<view
				class="tab {section === item.id ? 'tab-active' : ''}"
				onbindtap={() => (section = item.id)}
			>
				<text class="tab-text {section === item.id ? 'tab-text-active' : ''}">{item.label}</text>
			</view>
		{/each}
	</view>

	{#if section === 'todo'}
		<TodoList />
	{:else if section === 'style'}
		<StyleDemo />
	{:else}
		<ListDemo />
	{/if}
</scroll-view>

<style>
	.page {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100vh;
		background: linear-gradient(160deg, #fff5f0 0%, #ffffff 45%, #ffe8dd 100%);
		padding: 32rpx;
		gap: 24rpx;
	}
	.header {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}
	.logo {
		width: 96rpx;
		height: 96rpx;
		border-radius: 24rpx;
	}
	.title {
		font-size: 56rpx;
		font-weight: bold;
		color: #ff3e00;
	}
	.subtitle {
		font-size: 26rpx;
		color: #8a8a8a;
	}
	.tabs {
		display: flex;
		flex-direction: row;
		gap: 16rpx;
	}
	.tab {
		padding: 14rpx 28rpx;
		border-radius: 999rpx;
		background-color: #f1f1f1;
	}
	.tab-active {
		background-color: #ff3e00;
	}
	.tab-text {
		font-size: 28rpx;
		color: #333333;
	}
	.tab-text-active {
		color: #ffffff;
		font-weight: bold;
	}
</style>
