<script>
	let { todo, ontoggle, onremove } = $props();
</script>

<view class="item {todo.done ? 'item-done' : ''}">
	<view class="main" onbindtap={ontoggle}>
		<view class="check {todo.done ? 'check-on' : ''}">
			{#if todo.done}
				<text class="check-text">✓</text>
			{/if}
		</view>
		<text class="text {todo.done ? 'text-done' : ''}">{todo.text}</text>
	</view>
	<view class="remove" oncatchtap={onremove}>
		<text class="remove-text">×</text>
	</view>
</view>

<style>
	.item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 18rpx 22rpx;
		border-radius: 18rpx;
		background-color: #ffffff;
		border: 1rpx solid #eeeeee;
	}
	.item-done {
		background-color: #fafafa;
	}
	.main {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 16rpx;
		flex: 1;
	}
	.check {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		border: 2rpx solid #cccccc;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.check-on {
		background-color: #ff3e00;
		border-color: #ff3e00;
	}
	.check-text {
		color: #ffffff;
		font-size: 24rpx;
	}
	.text {
		font-size: 30rpx;
		color: #333333;
	}
	.text-done {
		color: #aaaaaa;
		text-decoration: line-through;
	}
	.remove {
		padding: 8rpx 14rpx;
	}
	.remove-text {
		font-size: 36rpx;
		color: #bbbbbb;
	}
</style>
