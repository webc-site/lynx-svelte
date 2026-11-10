<script>
	import { onMount } from 'svelte';
	import TodoList from './component/TodoList.svelte';
	import StyleDemo from './component/StyleDemo.svelte';
	import ListDemo from './component/ListDemo.svelte';

	const viewportWidthGet = () => {
		if (typeof window !== 'undefined' && window.innerWidth > 0) return window.innerWidth;
		const info = globalThis.SystemInfo;
		if (info?.pixelWidth > 0) return info.pixelWidth / (info.pixelRatio || 1);
		return 375;
	};

	let viewportWidth = $state(viewportWidthGet()),
		layoutMode = $derived(viewportWidth >= 720 ? 'wide' : viewportWidth <= 520 ? 'narrow' : 'medium'),
		shellWidth = $derived(viewportWidth > 1080 ? '1080px' : '100%');

	let section = $state('todo');
	const sections = [
		{ id: 'todo', label: 'Todo' },
		{ id: 'style', label: 'Style' },
		{ id: 'list', label: 'List' }
	];

	onMount(() => {
		if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
		const onResize = () => {
			viewportWidth = viewportWidthGet();
		};
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});
</script>

<scroll-view class="page">
	<view
		class="shell {layoutMode}"
		style="width: {shellWidth}; margin-left: auto; margin-right: auto"
	>
		<view class="header {layoutMode}">
			<image class="logo {layoutMode}" src="https://github.com/sveltejs/branding/raw/master/svelte-logo-square.png" />
			<view class="header-text {layoutMode}">
				<text class="title {layoutMode}">Svelte + Lynx</text>
				<text class="subtitle">PR #18042 custom renderer</text>
			</view>
		</view>

		<view class="tabs {layoutMode}">
			{#each sections as item (item.id)}
				<view
					class="tab {layoutMode} {section === item.id ? 'tab-active' : ''}"
					onbindtap={() => (section = item.id)}
				>
					<text class="tab-text {section === item.id ? 'tab-text-active' : ''}">{item.label}</text>
				</view>
			{/each}
		</view>

		<view class="content">
			{#if section === 'todo'}
				<TodoList />
			{:else if section === 'style'}
				<StyleDemo />
			{:else}
				<ListDemo />
			{/if}
		</view>
	</view>
</scroll-view>

<style>
	.page {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 100vh;
		background: linear-gradient(160deg, #fff5f0 0%, #ffffff 45%, #ffe8dd 100%);
	}
	.shell {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 1080px;
		padding: 32rpx;
		box-sizing: border-box;
		gap: 24rpx;
		margin-left: auto;
		margin-right: auto;
	}
	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8rpx;
	}
	.header-text {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
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
		flex-wrap: wrap;
		gap: 16rpx;
	}
	.tab {
		padding: 14rpx 28rpx;
		border-radius: 999rpx;
		background-color: #f1f1f1;
		display: flex;
		align-items: center;
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
	.content {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-width: 0;
	}

	.shell.wide {
		padding: 48rpx 56rpx;
		gap: 32rpx;
	}
	.tabs.wide {
		flex-wrap: nowrap;
	}
	.tab.wide {
		flex: 0 0 auto;
	}
	.header.wide {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	.header-text.wide {
		align-items: flex-end;
	}
	.tab.medium {
		flex: 1 1 auto;
	}
	.shell.narrow {
		padding: 24rpx;
		gap: 20rpx;
	}
	.header.narrow {
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.header-text.narrow {
		align-items: center;
	}
	.logo.narrow {
		width: 72rpx;
		height: 72rpx;
	}
	.title.narrow {
		font-size: 44rpx;
	}
	.tab.narrow {
		flex: 1 1 auto;
	}
</style>
